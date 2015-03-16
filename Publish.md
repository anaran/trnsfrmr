<a href='Hidden comment: 
#labels Featured
'></a>


# Preparation #

Make sure the manifest version has been incremented from the version last published in the Chrome Web Store.

Make sure changelog\_text has been updated in https://code.google.com/p/trnsfrmr/source/browse/Transformer/_locales/en/messages.json and https://code.google.com/p/trnsfrmr/source/browse/Transformer/_locales/de/messages.json (and any other future translations).

Use a third, possibly fourth, [version](http://developer.chrome.com/trunk/extensions/manifest.html#version) number component to publish unreleased versions to a limited audience (People with the link, Trusted testers).

Make sure you have tested the code you want to release. Generate a ZIP file as documented below and install that locally for [Testing](Testing.md).

# ZIP File Generation #

The top-level directory of your local git clone should look like this:

```
.git
CWS
Transformer
```

Use a command similar to this to create an extension ZIP file for a tagged git commit you want to publish:

```
git archive -o Transformerv1_8rc5.zip v1.8rc5 Transformer/
```

# Uploading #

Log in to your CWS developer dashboard and upload the ZIP file generated above.

Use the files in the CWS directory should you need to update icon (currently 128x128 pixels) or screenshots (currently 640x400 pixels).