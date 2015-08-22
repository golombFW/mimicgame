#global.json
For security reasons file global.json is not attached in this sources. 
If you want to deploy app to parse.com you have to create file global.json in this path.
global.json should look like this:
<pre><code>
	{
      "global": {
        "parseVersion": "1.5.0"
      },
      "applications": {
        "MimicGame": {
          "applicationId": "```<YOUR_APP_ID>```",
          "masterKey": "```<YOUR_APP_MASTER_KEY>```"
        },
        "_default": {
          "link": "MimicGame"
        }
      }
    }
</code></pre>