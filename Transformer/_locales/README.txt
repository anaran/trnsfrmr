Useful for conversion from orion string externalizer to chrome.i18n

// TODO Find unquoted object properties and double-quote them (conforms to JSON)‌
// Use find regexp replace to fix that for now:‌
// From:(\n)\s*("([^"\\]|\\.)*"):\s*("([^"\\]|\\.)*"),
// To:$1  $2: {$1    "message": $4,$1    "description": ""$1  },
// Options: [v] Regular expression‌
  