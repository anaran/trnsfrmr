# Introduction #

Add your content here.

# Details #

Add your content here.  Format your content with:
  * Text in **bold** or _italic_
  * Headings, paragraphs, and lists
  * Automatic links to other wiki pages

---

Lines are above are as created by the **New page** button.

# Conclusion #

`javascript:alert("ok")`

> javascript:alert("ok")

| javascript:alert("ok") |
|:-----------------------|

<a href='javascript:alert("ok")' title='test'>javascript:alert("ok")</a>

My tests below all failed.

Best I can come up with is to use the same links as used for the Rev column in the Source Changes tab, but abbreviated commit IDs seem to be sufficient:

e.g.

https://code.google.com/p/trnsfrmr/source/detail?r=17f9f55

And here is my importable Popchrom abbreviation definition for that:

`["tsd","[\"\\\\s+(\\\\S+)\",\"https://code.google.com/p/trnsfrmr/source/detail?r=$1\"]"]`


---

This page is used for testing wiki syntax and issue tracker integration.

Have do revision links work for git repositories?

Can the ID in the [Changes](https://code.google.com/p/trnsfrmr/source/list) Rev columns, prefixed with r be used just like under svn?

Let's try this:

r73b1580dd953

Nope! How about dropping the r prefix?

73b1580dd953

Nope!

How about the long form?

rbe7bbce2753c3d2b22d5e080de6f7778ab9a908b

Neither!

Without r:

be7bbce2753c3d2b22d5e080de6f7778ab9a908b

No!

how about first 7 digits prefixed with r?

r73b1580

Above are for the default repository, how about a commit to the wiki git repository?

re1a2d9c3f59c

re1a2d9c3f59c9d1d2b400601162daeb28c0fcae2

svne1a2d9c3f59c9d1d2b400601162daeb28c0fcae2

revision 86650d90963f