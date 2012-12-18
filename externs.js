var _escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;

var urls = [];


function keys(obj)
{
  var keys = [];

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  return keys;
}


function isObject(obj) {
  return typeof obj === 'object';
}


function isClass(obj) {
  var result = (typeof obj === 'function' && typeof obj.prototype === 'object');
  return result;
}


function isFunction(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]';
}


function quoteString(string) {
  if (string.match(_escapeable)) {
    return '\'' + string.replace(_escapeable, function(a) {
      var c = _meta[a];
      if (typeof c === 'string') return c;
      c = a.charCodeAt();
      return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
    }) + '\'';
  }
  return '\'' + string + '\'';
}


function extern(obj) {
  var msg = '';
  var appendBrace = isObject(obj) || isFunction(obj);
  if (appendBrace)
    msg += '{';
  var k = keys(obj).sort();
  for (var i = 0; i < k.length; i++) {
    var p = k[i];
    if (msg.length > 1)
      msg += ',';
    //else {
    //if (Object.prototype.toString.call(obj) !== '[object Array]') {
    msg += quoteString(p) + ' : ';
    if (isObject(obj[p])) {
      var r = extern(obj[p]);
      if (r === '{}') {
        msg += 'function() {}';
      } else {
        msg += r;
      }
    } else if (isClass(obj[p])) {
      var r = extern(obj[p].prototype);
      if (r === '{}') {
        msg += 'function() {}';
      } else {
        msg += r;
      }
    } else if (isFunction(obj[p])) {
      msg += 'function() {}';
    } else {
      msg += '{}';
    }
    //}
    //                          }
  }
  if (appendBrace)
    msg += '}';
  return msg;
}


function extract(txt) {
  var result = '', obj, undefined;
  if (!txt)
    result = 'Please specify the object you want to export!';
  else {
    try {
      obj = eval(txt);
    }
    catch (e) {
      obj = undefined;
      result = e;
    }
    if (obj === undefined)
      result += '\n' + txt + ' is undefined!';
    else {
      var parents = txt.toString().split(/\./), i = 5;
      if (parents.length > 1) {
        do {
          var o = {};
          o[parents[parents.length - 1]] = obj;
          obj = o;
          parents.splice(parent.length - 1, 1);
          if (parents.length === 1)
            txt = parents[0];
        }
        while (parents.length > 0 && i-- > 0);
      }
      result = '// Externs file generated at ' + new Date() + '\n';
      result += '//\n';
      result += '// Source URLs:\n';
      for (var i = 0; i < urls.length; i++) {
        result += '//   ' + urls[i] + '\n';
      }
      result += '//\n';
      result += '// Namespace: ' + txt + '\n\n';
      result += 'var ' + txt + ' = ' + extern(obj) + ';\n';
    }
  }

  beautify_options = {
    indent_size: 2,
    indent_char: ' ',
    preserve_newlines: true,
    space_after_anon_function: true,
    jslint_happy: false
  };
  $('#result').html(js_beautify(result, beautify_options));
  return false;
}


function log(msg) {
  $('#loadLog').prepend(msg + '<br/>');
}


var time;
function load(data) {
  urls.push(data.js);
  time = new Date().getTime();
  $.xLazyLoader($.extend(data, {
    success: logDiff,
    error: function(errors) {
      alert('failed');
      log('Load Failed: ' + errors);
    }

  }));

}

function logDiff(arg) {
  var time1 = new Date().getTime() - time;
  log('Loaded: ' + arg + ' in ' + time1 + ' ms');
}

