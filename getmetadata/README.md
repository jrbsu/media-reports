# getmetadata
php scripts to get meta data from an outside ajax request

In general the consumer needs to send a post request with an action and url.
This is usually done in JSON but isn't required.

## available 'actions':
* 'title' - The script will respond back, in JSON (watch for quotes) with the html `<title>` of the url you sent.
* 'descritption' - The script will respond back, in JSON (watch for quotes) with the meta tag labeled as name='description' at the url you sent.
* 'ogdescription' - The script will respond back, in JSON (watch for quotes) with the meta tag labeled as property='og:description' at the url you sent

## Notes:
* og:description (or the Open Graph description) is the description offered to facebook etc. See [this page](http://ogp.me/) for more info on the open graph protocol.
* The 'description' action will fall back to an open graph description if it finds one and doesn't find a traditional description. (probably rare). Currently 'ogdescription' does not to the reverse. Let me know if it should...

## Requires:
* PHP5
* Apache
* PHP5-curl
