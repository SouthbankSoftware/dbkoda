# dbKoda release notes

For more information about dbKoda, visit out website [dbkoda.com](www.dbkoda.com).

To get help or to request features or simply to tell us what you think, visit our support system at https://dbkoda.useresponse.com.

To access our source code, visit https://github.com/SouthbankSoftware/dbkoda.

## Version 0.10.0

Monday March 19th 2018

This release contains some cool new features, some slightly less cool but still helpful bug fixes and some possibly not cool but also hopefully minor bugs.

See our [blogs page](https://medium.com/dbkoda) for more detailed discussions about these new features.

### Performance View

dbKoda can now provide you an X-ray view of what's going on under the hood of your MongoDB server by providing a graphical representation of real time performance at the server and OS level.  Our intuitive dashboard shows graphically the rate of activity at each layer of the stack - network, server, wiredTiger cache and disk subsystems. Read time data is displayed on the dashboard and you can view history by clicking on a metric. dbKoda will also generate a list of alarms if we think something isn't quite right with the server that can be viewed in a list format by clicking the exclamation marks on the side of each section. For more details checkout [This blob post](https://medium.com/dbkoda/announcing-the-dbkoda-0-10-performance-panel-3c2e6bdb421f). 

### Upgraded Connection Wizard

Claustrophobic? We've more than doubled the size of our Connection panel!

Our connection Panel was looking a little tired, so we've revamped the whole thing! Now connections can be created and edited from a full screen panel with tips and explanations of each field. This is also the first step for us adding a larger set of connection features and configuration items in the coming months.

### Password Manager

Entering passwords again and again can become tedious very quickly so we've added a Password Store to keep an encrypted version of your passwords (locally on your machine only) that you can access with a Master Password. Now you'll only have to enter your passwords once for each MongoDB instance you connect to. This should save you time that can be better spent looking at the beautiful performance graphs we've added.  Your passwords are encrypted and can only be extracted using the master password.  The master password system stores both SSH and mongoDB passwords.

### Known issues

*  Operating system metrics cannot be displayed for MongoDB servers running on Windows OS.  You can still display MongoDB metrics, but you can't see things like CPU utilisation or the run queue length.
*  We can only show limited information for MongoDB servers which are not using the WiredTiger storage engine
*  We currently report data from the master server in a replica set, and we don't yet support extracting statistics from a mongos process.
*  You currently must be looking at the dbKoda performance dashboard in order to view performance statistics.  In a future release, we hope to transmit the relevant information directly into your cerebral cortex.

### Minor Fixes

* You can now specify which port you would like to connect to via SSH.  Previously SSH connections could only be established over port 22.
* You can now export your table style output into a CSV or JSON formatted file. This is useful if you want to import your data into Excel or another similar program.  

## Version 0.9.0

Monday Jan 15th 2018

This release contains some important bug fixes and new features. It's the result of many hours of effort from the dedicated code monkeys working from our secret lair in Melbourne Australia.

See our [blogs page](https://medium.com/dbkoda) for more detailed discussions about these new features.

### Index advisor

dbKoda can advise you on indexes that should be created to avoid `COLLSCAN` and `SORT` conditions. First, generate an execution plan for a query. Then hit the "index advisor" button to get suggestions for new indexes. Press the "Add code" button if you want to create the indexes.

Note that the index advisor will sometimes suggest that you can drop old indexes when a new index is suggested. For instance, if we suggest an index on `{a:1,b:1}` and there is already an index on `{a:1}`, then we will suggest dropping the index on {a:1}.

### Remove unnecessary indexes

From a collection node in the database tree, you can select "remove unnecessary indexes". We'll create a script that will drop any indexes that are redundant. For instance if there is an index in `{a:1,b:1}` and another on `{a:1}`, we will suggest dropping the index on {a:1}.

### Update/Insert/Delete support

You can create insert, update or delete statements from a fill-in the blanks form in the database tree. This works in a similar way to the simple query builder.

### Remote SSH terminal

If you provide SSH credentials, you can open an SSH terminal to your mongo server. From there you can start or stop mongo instances, examine OS level configuration, accidentally remove the operating system, and so on.

### Local terminal

You can also open a terminal window to your local desktop. This might be handy if you want to run mongo command line tools, invoke a local editor, etc.

### Support for Drill SQL (experimental)

We now allow you to issue SQL commands against your MongoDB host using Apache Drill. This feature is a bit "experimental" - it is dependent both on the Apache Drill binaries and requires Java be installed on your local host. See [This blog post](https://dbkoda.useresponse.com/knowledge-base/article/how-to-use-drill-sql-in-dbkoda) for more details.

### Known issues

* After installing drill, you may need to right click and select "Query database with Drill" a second time to invoke the drill editor.

* On Microsoft Windows when using an SSH tunnel, an export or import may crash dbKoda, requiring a restart of our product. We'll be releasing a patch for this issue within a few weeks of the 0.9.0 release.
* After sitting at a desk and using dbKoda for a long time, your back or butt may get sore or numb. As a workaround for this problem, try standing up and moving around from time to time.

## Version 0.8.1

December 5th 2017

Minor bug fixes, particularly to the "phone home" telemetry.

## Version 0.8.0

Monday November 6th, 2017

In this major patch we added a few key features, made quality of life improvements to a number of existing parts of the application and tweaked various UI elements to keep dbKoda feeling fresh. Of course we also tried to fix as many bugs as possible. Check out our [blogs page](https://medium.com/dbkoda) for more in-depth discussions of these new features.

### Chart View

The Chart View allows a simple graphical representation of your query result that can be manipulated to visualise the size and shape of your data. The Chart View can be triggered directly by right clicking a result in the output or from the Generate Chart button in the Aggregation Builder.

### Table View

Sometimes you may want to view your data in a more traditional tabular format. To view your data in this way you may either right click on your result in the output, or right click on a collection in the Tree View and select View as Table.

### Preferences Panel

We have added a preferences panel for configuring some options like mongo path in the product, at the moment this menu is a little sparse, but we will fill it with more configuration items as the product develops.

### Driver Translation

To translate your MonogDB shell query into executable NodeJS Driver code, simply right click your query in the editor window, and choose the "Translate to Native Code" option, a new window will appear with code you can use in your NodeJS application.

### Connection configuration

We made a few minor changes to the connection panel. Specifically, you can now specify an authorisation database which differs from your connection database, and you can ignore invalid SSL certificates.

## Version 0.7.3

Friday October 13st, 2017

In this minor patch we updated our telemetry dialog and added some minor changes to the auto-updater to support differences in our next major release.

## Version 0.7.2

Thursday September 21st, 2017

In this hotfix release we fixed a few key bugs, as well as updating some error messages to be more specific and helpful to the user.

* Fixed an unforgivable bug which caused Windows connections to fail, even if a correct binary location had been entered into the config.yml file. Windows users please forgive us!
* Fixed an issue causing connections to fail with "Not Authorised" even when Authorisation has not been selected in the connection profile panel.
* Fixed an issue causing the connect button to be disabled after checking and unchecking the SSL option in the connection profile panel.
* Fixed an issue which showed the "Failed to Create Shell" error message even if shell creation succeeded, but the user does not have sufficient permissions on the connected database.
* Added a new dialogue to confirm whether a user would like to download any available updates.
* If a user modified the config.yml file to specify the location of their mongo binary, the application will now check this location whenever a connection is created, instead of just on application start.
* New logic has been added to detect corruption of the applications state, now backing up the corrupt store and notifying the user of what has occurred.

## Release 0.7.0

In this release we admitted that many of the features in the previous release were in fact bugs and we fixed them. We also introduced some new features which will turn out to be bugs but we don't know what they are yet, so we can't talk about them here.

We also introduced a few significant new features - [see this blog post](https://medium.com/dbkoda) - such as:

### Storage Drill-down display.

The storage drill down graphically shows how how database storage is distributed across databases, collections, indexes and embedded documents and arrays. You can find out the size of arrays and embedded documents within collections and how index size compares to data size.

### Aggregation Builder

The aggregation builder allows you to quickly and accurately build up complex aggregation pipelines in a graphical environment. See [this Youtube video](https://www.youtube.com/watch?v=-zrXpbG4zMc) for a demo of how quickly the Aggregation builder can work.

### Enhanced JSON viewer

The Enhanced JSON viewer allows you to explore the structure of complex JSON documents by expanding/collapsing long strings, arrays and subdocuments. It's available as a right click action wherever we show JSON output.

### Export/Import & Dump/Restore support

You can load or unload JSON documents from to or from your MongoDB server. This facility provides GUI access to the `mongodump`, `mongorestore`, `mongoexport` and `mongoimport` commands.

### SSH tunnelling support

You can now "tunnel" through an intermediate server if you do not have direct access to a MongoDB server you wish to work with. [This FAQ article](https://dbkoda.useresponse.com/knowledge-base/article/what-is-ssh-tunneling-and-how-do-i-set-it-up) explains how this works in more detail.

### Performance improvements on windows

In 0.6, the windows build would suffer significant delays when rendering large amounts of output. In 0.7, there should be no difference in performance between Windows, Mac and Linux. The Commodore 64 build is still pretty slow however.

## Release 0.6.1

This is a hotfix that corrects the error "Create Shell Connection Failed" when mongodb binaries are located in a local path but not in the system path. See https://dbkoda.useresponse.com/knowledge-base/article/dealing-with-create-shell-connection-failed-errors for further information about this bug.

## Release 0.6

### Improvements

Welcome to the first public release of dbKoda!

Absolutely everything in this release of dbKoda is an improvement over the previous version, which did not exist.

### Known limitations

Most of the known limitations in the product have workarounds which are documented in our FAQ - see https://dbkoda.useresponse.com/knowledge-base/faqs

##### Limited Permission issues

Some of the tree actions require MongoDB privileges that the connected user may not have. In these cases you might see an error such as "Sorry, we were unable to create the view"

##### Advanced authentication schemes

The current release does not support Kerberos, LDAP or legacy MongoDB authentication. We hope to add Kerberos and LDAP in an upcoming release.

##### Tree auto-refresh

When you perform a tree action that alters the tree, the tree will not automatically re-render. You will need to click the refresh button to see the new tree topology. Sorry about that!

##### Connecting to secondaries in replica sets

We don't current support a mechanism of connecting to anything but the primary node in a replica set. You can issue a CONNECT command within the editor or the command line to connect to the secondary after first connecting the primary.
