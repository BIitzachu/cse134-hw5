While I couln't personally ever see a flash of an incorrect theme on load. I adressed it by adding a script to the beginning of files before the stylesheets are loaded. This script checks the user's preferred color scheme and applies the correct theme before the stylesheets are loaded, preventing any flash of incorrect theme on load.

Using innerHTML when with things that don't come from you like a remote or user provided input is a security risk because malicious code could be injected into your page. To avoid this risk filling the template using textContent and setAttribute is safer.

