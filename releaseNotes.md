# dbKoda release notes

## Version 0.60

Monday July 17 2017

Welcome to the first public release of dbKoda!

For more information about dbKoda, visit out website [dbkoda.com](www.dbkoda.com). 

To get help or to request features or simply to tell us what you think, visit our support system at https://dbkoda.useresponse.com. 

### Improvements

Absolutely everything in the product is an improvement over the previous version, which did not exist. 

### Known limitations

Most of the known limitations in the product have workarounds which are documented in our FAQ - see https://dbkoda.useresponse.com/knowledge-base/faqs

#### Limited Permission issues

Some of the tree actions require MongoDB privileges that the connected user may not have.  In these cases you might see an error such as "Sorry, we were unable to create the view"

#### Advanced authentication schemes

The current release does not support Kerberos, LDAP or legacy MongoDB authentication.  We hope to add Kerberos and LDAP in an upcoming release. 

#### Tree auto-refresh

When you perform a tree action that alters the tree, the tree will not automatically re-render.  You will need to click the refresh button to see the new tree topology.  Sorry about that. 

#### Connecting to secondaries in replica sets

We don't current support a mechanism of connecting to anything but the primary node in a replica set.  You can issue a CONNECT command within the editor or the command line to connect to the secondary after first connecting the primary. 
