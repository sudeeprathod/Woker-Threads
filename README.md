before start
run command "npm i"

to run application type 
"node index.js" in command line or terminal

save Csv file Data using worker threads and divid data among worker threads

method: post

http://localhost:4000/api/users

parameters
{csvFile:data.csv}


///////////////////////////////////additional Thing//////////////////////////////////////////////////
get policy by userName 
method: get
pass your email as userName
http://localhost:4000/api/users?userName=draper@yahoo.com




get agg data of user and policy
method: get
pass object id to get the agg data
http://localhost:4000/api/users/agg?id=5fd713431f5c2853e4475cac




insert message at specific time 
method:post
http://localhost:4000/api/users/insert
body:{
  date: '2020-12-13',
  time: '12:36am',
  message: 'absdajsd asdbakjsdnkas'
}




bash script to restart server if cpu usage crosses 70%
start program = "system path start"
stop program = "system path stop"
if cpu > 70% for 2 cycles then restart



