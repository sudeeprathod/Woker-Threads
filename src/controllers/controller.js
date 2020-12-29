const User = require('../models/user');
const Policy = require('../models/policy');
const UserAccount = require('../models/userAccount');
const LOB = require('../models/lob');
const carrier = require('../models/carrier');
const Message = require('../models/message');




const csv = require("csvtojson")
const os = require("os")
const path = require("path")
const async = require("async");
const cron = require('node-cron');



const { Worker, isMainThread } = require('worker_threads');
const { use } = require('../routes/route');
const { insertMany } = require('../models/user');
const numberCPUS = os.cpus().length
let bigArray
let mainArray = []



const workerScript = path.join(__dirname, "/worker.js");
// we turn the worker activation into a promise
let _id
const sortArrayWithWorker = arr => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(workerScript, { workerData: arr });
        worker.on("message", (data) => {
            async.eachSeries(data, (obj, next) => {
                const user = new User({
                    firstname: obj.firstname,
                    Dob: obj.dob,
                    address: obj.address,
                    phoneNumber: obj.phone,
                    state: obj.state,
                    zipCode: obj.zip,
                    email: obj.email,
                    gender: obj.gender,
                    userType: obj.userType,
                });
                user.save()
                    .then(obj1 => {
                        _id = obj1._id
                        const policy = new Policy({
                            policy_number: obj.policy_number,
                            policy_start_date: obj.policy_start_date,
                            policy_end_date: obj.policy_end_date,
                            policy_category_name: obj.policy_category_name,
                            agency_id: obj.agency_id,
                            userID: _id
                        })
                        policy.save()
                    })
                    .then(obj1 => {
                        const userAccount = new UserAccount({
                            userAccount: obj.userAccount,
                            userID: _id
                        })
                        userAccount.save()
                    })
                    .then(obj1 => {
                        const lob = new LOB({
                            category_name: obj.category_name,
                            userID: _id
                        })
                        lob.save()
                    })
                    .then(obj1 => {
                        const carr = new carrier({
                            company_name: obj.company_name,
                            userID: _id
                        })
                        carr.save()
                    })
                    .then(obj1 => {
                        next()
                    })
            })

        });
        worker.on("error", reject);
    });
};

// this function will distribute the array across workers
async function distributeLoadAcrossWorkers(workers) {
    // how many elements each worker should sort
    const segmentsPerWorker = Math.round(bigArray.length / workers);
    const promises = Array(workers)
        .fill()
        .map((_, index) => {
            let arrayToSort;
            if (index === 0) {
                // the first segment
                arrayToSort = bigArray.slice(0, segmentsPerWorker);
            } else if (index === workers - 1) {
                // the last segment
                arrayToSort = bigArray.slice(segmentsPerWorker * index);
            } else {
                // intermediate segments
                arrayToSort = bigArray.slice(segmentsPerWorker * index, segmentsPerWorker * (index + 1))
            }
            return sortArrayWithWorker(arrayToSort)
        });
    // merge all the segments of the array
    const segmentsResults = await Promise.all(promises);
    return segmentsResults.reduce((acc, arr) => acc.concat(arr), []);
}

// Create and Save a new User
exports.create = (req, res) => {
    // Validate request
    if (!req.file) {
        return res.status(400).send({
            message: "No Csv file found"
        });
    }
    console.log(req.file, "here")
    csv()
        .fromFile(req.file.path)
        .then((jsonObj) => {
            bigArray = jsonObj
            distributeLoadAcrossWorkers(numberCPUS)
            res.send({
                status: 200,
                message: "your file is being processed"
            })
        })
};

// Find a single User with a id
exports.findOne = (req, res) => {
    console.log(req.query.email, "++++++")
    let data
    User.findOne({ email: req.query.userName })
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.id
                });
            }
            data = user
            //res.send(user);
        })
        .then(user => {
            Policy.findOne({ userID: data._id }, function (err, data) {
                if (err) {
                    res.send({
                        message: err
                    })
                } else {
                    res.send({
                        status: 200,
                        data: data
                    })
                }
            })
        })
};

exports.aggre = (req, res) => {
    console.log(req.query.id)
    //let data
    User.findOne({ _id: req.query.id })
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "User not found with id " + req.params.id
                });
            }
            //data = user
            Policy.findOne({ userID: user._id })
                .then(data => {
                    let policy = {
                        policy_number: data.policy_number,
                        policy_start_date: data.policy_start_date,
                        policy_end_date: data.policy_end_date,
                        policy_category_name: data.policy_category_name,
                        agency_id: data.agency_id,
                    }

                    let newObj = {
                        firstname: user.firstname,
                        Dob: user.dob,
                        address: user.address,
                        phoneNumber: user.phone,
                        state: user.state,
                        zipCode: user.zip,
                        email: user.email,
                        gender: user.gender,
                        userType: user.userType,
                        policy: [policy]
                    }
                    res.send({
                        status: 200,
                        data: newObj
                    })

                })
        })

};

function convertDate(date) {
    var dateTimeParts = date.split(' ');

    if (dateTimeParts[1].indexOf(' ') == -1 && dateTimeParts[2] === undefined) {

        var theTime = dateTimeParts[1];
        var ampm = theTime.replace(/[0-9:]/g, '');
        var time = theTime.replace(/[[^a-zA-Z]/g, '');
        if (ampm == 'pm') {
            time = time.split(':');
            if (time[0] == 12) {
                time = parseInt(time[0]) + ':' + time[1] + ':00';
            } else {
                time = parseInt(time[0]) + 12 + ':' + time[1] + ':00';
            }
        } else { // if AM
            time = time.split(':');
            if (time[0] < 10) {
                time = '0' + time[0] + ':' + time[1] + ':00';
            } else {
                time = time[0] + ':' + time[1] + ':00';
            }
        }
    }
    var dateObj = new Date(dateTimeParts[0]);
    var dayOfMonth = (dateObj.getDate() < 10 ? ("0" + dateObj.getDate()) : dateObj.getDate());
    var yearMoDay = dateObj.getFullYear() + '-' + (dateObj.getMonth() + 1) + '-' + dayOfMonth;
    var date = new Date(yearMoDay + 'T' + time);
    return date;
}

function cronJOb() {
    console.log("cron job started")
    cron.schedule('*/2 * * * *', () => {
        console.log('running a task every two minutes');
        insert()
    });
}

function insert() {
    console.log("herer")
    let current = Date.now()
    var result = mainArray.filter(obj => {
        return obj.timeStamp <= current
    })
    if (result && result.length > 0) {
        async.eachSeries(result, function (data, next) {
            console.log(mainArray, "lllllllllllllllllllllllllllll")
            const msg = new Message({
                message: data.msg
            });
            msg.save()
            mainArray = mainArray.filter(e => {
                return e.timeStamp != data.timeStamp;
            });
            next()
        })
    }
}
cronJOb()

exports.atTimeInsert = (req, res) => {
    let flag = false
    if (req.body.time.includes('pm')) {
        flag = true
    }
    if (req.body.time.includes('am')) {
        flag = true
    }
    if (!flag) {
        req.body.time = req.body.time + "am"
    }
    console.log(req.body)
    let timeAndDate = req.body.date + " " + req.body.time
    let a = convertDate(timeAndDate)
    console.log(a.getTime(), '----')
    mainArray.push({ msg: req.body.message, timeStamp: a.getTime() })
    res.send({
        msg: "message has been processed"
    })


}
