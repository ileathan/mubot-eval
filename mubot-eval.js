// Description:
//   eval

const _eval = require('eval');
const inspect = require('util').inspect;
const { curry, always, append, concat, ifElse, isEmpty, join, map, mergeAll, pipe, reject, test, repeat } = require('ramda');

const repeatStr = pipe(repeat, join(''))

const S = require('sanctuary');
const R = require('ramda');
const RF = require('ramda-fantasy');
const vm = require('vm');
const treisInit = require('treis').__init;


const wrap = curry((x, s) => x + s + x);
const mdLink = curry((text, url) => `[${text}](${url})`);
const mdBold = wrap('**');
const mdStrike = wrap('~~');
const mdPre = wrap('`');
const mdCode = curry((lang, str) => '```' + lang + '\n' + str + '\n```');
const mdHeader = (n, text) => [ '#'.repeat(n), text ].join(' ');

const evalCode = str => {
  const output = [];
  const fakeConsole = {
    log: (...arg) => {
      output.push(join(' ', map(inspect, arg)));
      return void 0;
    }
  }
  const timeouts = [];
  const fakeSetTimeout = (fn, ms) => {
    let timeout;
    timeouts.push(new Promise((res, rej) => {
      timeout = setTimeout(() => {
        try {
          fn();
          res();
        } catch (e) {
          rej(e);
        }
      }, ms);
    }));
    return timeout;
  }
  const treis = treisInit(fakeConsole.log, false);
  const sandbox = mergeAll([
    { R, S, console: fakeConsole, treis, trace: treis, setTimeout: fakeSetTimeout },
    R,
    RF
  ]);
  let value
  try {
    value = vm.runInNewContext(str, sandbox, {
      timeout: 10000
    });
  } catch (e) {
    return Promise.reject(e);
  }

  return Promise.all(append(Promise.resolve(value), timeouts))
    .then(always({ value, output }))
  ;
}

const nlMdCode = lang => pipe(mdCode(lang), concat('\n'));
const isMultiline = test(/\n/);
const inspectInfinite = (val) => inspect(val, { depth: Infinity });
const getErrorMessage = (e) => e.message || String(e);
const formatValueToReply = pipe(inspectInfinite, nlMdCode('js'));
const formatErrorToReply = pipe(getErrorMessage, ifElse(isMultiline, nlMdCode('text'), mdPre));

const formatOutput = (arr) =>
  join('\n', [
    mdHeader(1, 'Output'),
    mdCode('', join('\n', arr))
  ])
;
const formatReply = res =>
  join('\n', reject(isEmpty, [
    formatValueToReply(res.value),
    isEmpty(res.output) ? '' : formatOutput(res.output)
  ]))
;
const fakeEval = msg => {
  let cmd = res.match[1];
  evalCode(cmd)
    .then(done)
    .catch(done)
  ;
  const done = res => { msg.send(formatReply(res)); addToLog(cmd, res) }
}
;
const realEval = msg => {
  let bot = msg.robot;
  let cmd = msg.match[1];
  if(allowed.includes(msg.message.user.id)) {
    if(!/^(module\.)exports ?=/.test(cmd)) {
      /[;]/.test(cmd) && (cmd = '{' + cmd + '}')
      cmd = 'module.exports=(bot=>' + cmd + ')(robot)';
    }
    let result = _eval(cmd, true);
    result = JSON.stringify(result, null, 2) || 'true';
    bot.brain.save();
    msg.send(result);
    addToLog(cmd, result);
  } else {
    cmd = cmd.replace(/^(module\.)?exports\s?=\s?/,'');
    msg.match[1] = cmd;
    fakeEval(msg);
  }
}
;

var evals, saved;

const allowed = ['183771581829480448', 'U02JGQLSQ']
const commands = ['length', 'amount', 'clear', 'delete', 'del', 'search', 'last']

const addToLog = (cmd, result) => !!(evals[cmd] ? delete evals[cmd] && (evals[cmd] = res) : evals[cmd] = res)

const getLengths = msg => {
  const mode = msg.match[1];
  const formatLengthReply = mode => {
    const obj = mode === 'saved' ? saved : evals;
    const cmds = mode === 'saved' ? Object.values(obj) : Object.keys(obj);
    const amnt = cmds.length;
    const last = cmds.pop();
    return "There's "+amnt+" "+mode+" evals." + (amnt ? " Last: " + formatCmd(last) : "");
  }
  mode ?
    msg.send(formatLengthReply(mode))
  :
    msg.send(formatLengthReply('saved') + '\n' + formatLengthReply('evals'))
  ;
}
;
const deleteAllCmds = msg => {
  const mode = msg.match[1];
  if(mode === ' all') {
    const amntDelSaved = Object.keys(saved).length;
    const amntDelLog = Object.keys(evals).length;
    for(let key in evals) delete evals[key];
    for(let key in saved) delete saved[key];
    return msg.send("Deleted " + amntDelLog + " log evals and " + amntDelSaved + " saved evals.");
  }
  const obj = isModeSave(mode) ? saved : evals;
  const amntDel = Object.keys(obj).length;
  for(let key in obj) delete obj[key];
  msg.send("Deleted " + amntDel + " " + mode + " evals.");
}
;
const runLastCmd = msg => {
  var mode = msg.match[3];
  mode === void 0 ?
    mode = 'saved'
  :
    mode = isModeSave(mode)
  ;
  last_mode = mode ? 'saved' : 'evals';
  var last = last_mode === 'saved' ? Object.values(obj).pop() : Object.keys(obj).pop();

  if(!last)
    return msg.send("There is no last "+last_mode+" command.")
  ;
  realEval(last);
}
;
const runCmd = msg => {
  var tag = msg.match[1];
  if(commands.includes(tag.toLowerCase()))
    return
  ;
  saved[tag] ?
    cmd = saved[tag] && (last_mode = 'saved')
  :
    cmd = Object.keys(evals)[tag] && (last_mode = 'evals')
  ;
  if(!cmd)
    return msg.send("No command found.")
  ;
  msg.match[1] = cmd;
  realEval(msg)
}
;
const saveCmd = msg => {
  var [, cmdIndx, tag ] = msg.match;
  if(!tag) {
    tag = cmdIndx;
    cmdIndx = Object.keys(evals).length - 1;
  }
  const cmd = Object.keys(evals)[cmdIndex];
  ;
  if(!cmd)
    return msg.send("No command found.")
  ;
  saved[tag] = cmd;
  msg.robot.brain.save();
  msg.send("Saved " + formatCmd(cmd) + ' as ' + tag + '.');
}
;
const formatCmd = cmd => {
  if(!cmd) return null;
  cmd = cmd.replace(/^(module\.)?exports\s?=\s?/,'').slice(0,20);
  return '`' + cmd + (cmd.length > 20 ? '..' : '') + '`'
}
;
const isModeSave = str => /\s*-?(s(aved?)|tag(ged|s)?|recorded)\s*/.test(str)
;
const deleteCmds = msg => {
  var [, mode, ignore, delCmd ] = msg.match;
  var obj = isSaved(mode) ? saved : evals;
  var startAt, endAt, res;
  if(saved[delCmd]) {
    res = "Deleted " + formatCmd(saved[delCmd]) + ".";
    delete saved[delCmd];
  }
  else if(Object.keys(evals)[delCmd]) {
    res = "Deleted " + formatCmd(evals[delCmd]) + ".";
    delete evals[delCmd];
  }
  else if(/[!]|last/i.test(delCmd)) {
    let obj;
    last_mode === 'saved' ?
      delCmd = Object.values(saved).pop()
    :
      delCmd = Object.keys(evals).pop()
    ;
    res = "Deleted " + formatCmd(obj[delCmd]) + ".";
    delete obj[delCmd];
  } else {
    let keys = Object.keys(obj);
    delCmd = delCmd.split(/\s*-\s*/);

    if(delCmd.length === 1) {
      let i = +delCmd[0];
      i > 0 ? keys = keys.slice(i) : keys.splice(i);
      for(let key in keys) delete obj[key];
      res = "Deleted " + keys.length + " evals."
    }
    else if(delCmd.length === 2) {
      let [startAt, endAt] = delCmd;

      startAt > 0 && --startAt
      startAt > -1 ?
        endAt || (endAt = keys.length)
      :
        endAt = void 0
      ;
      ignore ? keys.splice(startAt, endAt) : keys = keys.slice(startAt, endAt);
      for(let key in keys) delete obj[key];
      res = "Deleted " + keys.length + " evals."
    }
    else res = "Could not parse request."
  }
  bot.brain.save();

  return msg.send(res || "No Command(s) found.")
}
;

module.exports = bot => {
  var last_mode = 'evals';
  // Load commands from brain.
  bot.brain.on('loaded', () => {
    evals = bot.brain.data.evals || (bot.brain.data.evals = {})
    saved = bot.brain.data.savedEvals || (bot.brain.data.savedEvals = {})
  });
  // Force fake eval
  bot.respond(/(?:-f |fake )`([^`]+)`/i, fakeEval);
  bot.respond(/(?:-f |fake )```[a-z]*\n?((?:.|\n)+)\n?```/i, fakeEval);
  // Delete All commands
  bot.hear(/^[!](?:clear|del(?:ete)?) all(?: ([\S]+))?/i, deleteAllCmds);
  // Delete commands
  bot.hear(/^[!](?:clear|del(?:ete)?)(?: ([\S]+))?(?: -?(i(?:gnore)?))?(.+)?$/i, deleteCmds)
  // Commands length
  bot.hear(/^[!](?:length|amount)( [\S]+)?/i, getLengths)
  // Run last command
  bot.hear(/[!]([!]|last)( (.*))?/i, runLastCmd)
  // Run command <cmd>
  bot.hear(/^[!](.+)/i, runCmd);
  // Save a command
  bot.hear(/[!](?:save) (.+)(?: (.+))?/i, saveCmd);



  const buildHearRegex = re => RegExp('(?:!|(?:[@]?' + (robot.name || robot.alias) + '[:,]\s?)) + re', 'i');

  // Run commands
  bot.hear(buildHearRegex('`([^`]+)`'), realEval);
  bot.hear(buildHearRegex('```[a-z]*\n?((?:.|\n)+)\n?```'), realEval);
  // View command
  bot.hear(buildHearRegex('[!](saved|evals)(?: logs?)?( [\S]+)?(?: -?(i(?:gnore)?))?(?: (-?\d+))?(?:(?: |-| - )(\d+))?'), msg => {
    let [, mode, res, ignore, startAt, endAt ] = msg.match
    ;
    mode = isSaved(mode)
    let commands = res ? Object.values(mode?saved:evals) : Object.keys(mode?saved:evals);
    startAt = startAt > 0 ? --startAt : startAt || 0;
    startAt > -1 ?
      endAt = endAt || commands.length
    :
      endAt = void 0
    ;
    if(startAt > commands.length || endAt > commands.length || startAt > endAt || startAt === 0)
       return res.send("Your startAt and endAt parameters are invalid!")
    ;
    let oldlength = commands.length;

    ignore ? commands.splice(startAt, endAt) : commands = commands.slice(startAt, endAt);

    let length = commands.length;

    var i = startAt > -1 ?
      length > 17 ? length - 17 + startAt : startAt
    :
      oldlength + +startAt - 1
    ;
    length > 17 && (commands = commands.slice(-17));
    msg.send("("+length+") " + commands.map(_=>
      i++ + ': ' + formatCmd(_)
    ).join(', '))
  });
}


