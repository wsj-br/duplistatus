![duplistatus](../documentation/static/img/duplistatus_banner.png)

# TODO List

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Fix](#fix)
- [Changes needed](#changes-needed)
- [New Features (planned or under analysis)](#new-features-planned-or-under-analysis)
- [Nice to have](#nice-to-have)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

<br/><br/>

## Fix

- remove the SMTP verbosity when sending test and notifications in the log and better connections error treatment with clear user messages: 

  - look this case: 

   show this message:
   `Failed to create email transporter: The SMTP server at smtp.gmail.com:587 does not support STARTTLS. Please change the connection type to "Plain SMTP" or use "Direct SSL/TLS" if your server supports it.`

   but the error was
      `Original error: Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to 535 5.7.8  https://support.google.com/mail/?p=BadCredentials 5b1f17b1804b1-47d7f6f0e15sm6384205e9.10 - gsmtp`

  - other example:

     show this `Failed to create email transporter: Cannot establish SSL/TLS connection to smtp.gmail.com:587. The server may not support direct SSL/TLS on this port. Try using "STARTTLS" or "Plain SMTP" instead, or use port 465 for SSL/TLS.`
     
     but the original was `Original error: 48A21CF32A7F0000:error:0A00010B:SSL routines:tls_validate_record_header:wrong version number:../deps/openssl/openssl/ssl/record/methods/tlsany_meth.c:84:`

    
  - these messages don't have to be in the log in production mode:

  
```
[API Test Email] Cache cleared, reading fresh SMTP config from database
[API Test Email] Read SMTP config: {
  host: 'smtp.gmail.com',
  port: 587,
  connectionType: 'starttls',
  requireAuth: true
}
[SMTP Config] Creating transporter with: {
  host: 'smtp.gmail.com',
  port: 587,
  connectionType: 'starttls',
  requireAuth: true,
  username: '***',
  hasPassword: true
}
[API Test Email] Cache cleared, reading fresh SMTP config from database
[API Test Email] Read SMTP config: {
  host: 'smtp.gmail.com',
  port: 465,
  connectionType: 'ssl',
  requireAuth: true
}
[SMTP Config] Creating transporter with: {
  host: 'smtp.gmail.com',
  port: 465,
  connectionType: 'ssl',
  requireAuth: true,
  username: '***',
  hasPassword: true
}
```


 - this message is ok to be in the log in production mode:

    `Email sent successfully: <c8a9def4-6944-1130-5eab-279cb054fbd0@wsj.com.br`

   but ideally has to show the to: address and the timestamp



<br/>


## Changes needed

  - Settings > Backup Monitoring
    - remove the legacy `Backup Name` column 
    - consider to add a icon in addition to the change the color of the chevrons to blue when the server/backup has additional destinations

  - Duplicati config buttom: implement a right-click to open the duplicati web configuration in the old ui (http://xxxxx:8200/ngax) to avoid the login issues with the new UI

  - Error display in UI
     -  Instead of showing error messages as temporary toast, show them as permanent, the user need to close it. 
     - Another option is to log it and show a icon (lucide:bell), when clicking see the list of previous errors.

<br/>

## New Features (planned or under analysis)

- make the documentation button be aware of the current page and open the correct documentation page.

- visualize the docker logs in the web interface (settings page)

- internationalization with versions initially in english, spanish, french and portuguese (pt-br).

- implement the suggestion from Taomyn: 

  >  BTW, for a future update you might want to consider anywhere you show the week days that it adheres to local regional settings i.e. the week begins on a Monday ;-)'

- create a environment variable, when set it will relax the new password rules for users, also one to configure the minimum acceptable password characters.

- check if make sense to group servers in a hierarchy

<br/>

## Nice to have

none



