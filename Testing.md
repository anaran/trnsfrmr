

# Peparation #

Testing the latest Popchrom sources for your environment and use cases would be very valuable to us.

Just make sure first to export all your abbreviations from your Popchrom last installed from Chrome Web Store (V1.7 as of this writing)!

But see related [issue 79](https://code.google.com/p/trnsfrmr/issues/detail?id=79) and [issue 80](https://code.google.com/p/trnsfrmr/issues/detail?id=80).

You could just copy/paste the export data into a gmail draft for later use.

You have two options for import

  * The **`[ Import ]`** button on the Popchrom Options page
  * The context menu entry **`[ Add/Import Popchrom abbreviation(s) for 'SELECTION' ]`**

# Getting Sources #

Usually, you would use
https://code.google.com/p/trnsfrmr/source/checkout
to get a working copy.

But if you just want to get the data of the git master branch HEAD, this might also be handy:
`wget --no-parent --recursive http://trnsfrmr.googlecode.com/git/Transformer/`

# Manage Extensions, Installation #

In Google Chrome chrome://extensions/ you would first disable the offical version of Popchrom (ID: iinhokidgfoomcighckbjmlcndbjmomp).

Also turn on Developer mode on that page to get the **`[ Load unpacked extension... ]`** button
and one more link (Inspect views: background.html).
(You can also **`[ Reload] ]`** the unpacked extension here via that link later.)

Then you would **`[ Load unpacked extension... ]`** and navigate to your
trnsfrmr.googlecode.com/git/Transformer/
folder.

# Testing #

You'll have to reload any page on which you want to load the new Popchrom version.

See if you get **`[ *Submit New Popchrom Issue for 'SELECTION'* ]`** in the context menu of any input field and try it out.

Don't submit that New Issue unless you really want to report a problem.

## Automated Testing ##

We haven't decided on a testing framework yet.

Please get in contact if you want to contribute.
