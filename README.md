# This is CAS example to achieve the SSO

Central Authentication Service Example Node.js Version

## Bootstrap

1. modiyfy /etc/hosts with following setting, and run `npm install`
    ```
    127.0.0.1       test.example1.com
    127.0.0.1       test.example2.com
    127.0.0.1       test.cas-example.com
    ```
2. `node ap1.js`
3. `node ap2.js`
4. `node cas.js`
5. go to `http://test.example1.com:4000/` to login, username: 123, password: 123
6. go to `http://test.example2.com:5000/`, you'll be redirect to manager page becase you've logined in step 5.
7. you can exit the program, and re-run the nodejs. Then go `http://test.example2.com:5000/` first to login.

## Work Flow

There are three servers.  
AP1 server is the applcation server 1 written in the ap1.js.  
AP2 server is the applcation server 2 written in the ap2.js.  
CAS server is written in the cas.js.  

When you click login url in the AP1, you'll be redirect to the CAS login page.  
After you login successfully, CAS will generate the cookie information which you already logined.  
Then you go to the AP2, you click login url and you'll be redirect to the CAS login page.  
But, this time CAS konwn you by the cookie information. So, you don't need to login again, and then you'll be redirect to the AP2.  