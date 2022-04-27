exports.form = `
  <!DOCTYPE html>
  <head>
    <link rel="stylesheet" href="https://unpkg.com/purecss@2.1.0/build/pure-min.css" integrity="sha384-yHIFVG6ClnONEA5yB5DJXfW2/KC173DIQrYoZMEtBvGzmf0PKiGyNEqe9N6BNDBH" crossorigin="anonymous">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      #form {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
    </style>
  </head>
  <html>
    <body>
      <form id="form" action="/" method="post" target="_blank"  class="pure-form pure-form-aligned">
        <fieldset>
          <div class="pure-control-group">
            <label for="cname">Channel name</label>
            <input type="text" name="cname"/>
          </div>
          <div class="pure-controls">
            <input type="submit" value="Submit" class="pure-button pure-button-primary">
          </div>
        </fieldset>
      </form>
    </body>
  </html>
  `;

exports.success = `
<!DOCTYPE html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    #foo {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
  </style>
</head>
<html>
  <body>
    <span id="foo">Success</span>
  </body>
</html>
`

exports.failure = `
<!DOCTYPE html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    #foo {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
  </style>
</head>
<html>
  <body>
    <span id="foo">Channel name not valid</span>
  </body>
</html>
`