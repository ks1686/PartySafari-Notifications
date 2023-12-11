## Explanation

Use these files and call the functions in your HTML code to enable sharing to social media that specific page. Must be done on a page-by-page basis. Copy paste HTML below:

```html
<div id="shareButtonsContainer">
  <script src="assets/js/twitterButton.js"></script>
  <script src="assets/js/facebookButton.js"></script>

  <script>
    //Call the functions to create the buttons during HTML rendering
    createTwitterShareButton(document.getElementById("shareButtonsContainer"));
    createFacebookShareButton(document.getElementById("shareButtonsContainer"));
  </script>
</div>
```
