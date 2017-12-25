# mubot-eval
Records and saves code evaluations from chatrooms. (Mubots eval command integration for Hubot.)

# Features

  1.) Use your normal Hubot/Mubots name or a quick trigger !.
  2.) Allow a seperate list of tagged commands to be saved.
  2.) Allow deleted both tagged and logged evals seperatly.
  3.) Allow replaying saved commands by tag or index.
  4.) Super user mode.

There are 2 modes. One which is a fork of a hubot scripts package and runs in a full sandbox, to allow module requires you must define them manually. and the other directly evaluates code against the live robot code. That is to say the in memory values are directly alterable and also system access equivilant to the bots process. *Do not* add power users that are not you or people you trust with full system access. I will in the future add a third mode which sandboxes the user within the bot itself.

# Usage

```
  leathan: mubot `7+7`
  Mubot: 14

  leathan: mubot `(()=>"With <3 from leat.io.")`
  Mubot: With <3 from leat.io.

  leathan: mubot evals
  Mubot: (2): `7+7`, `(()=>"With <3 from l..`

  leathan: mubot run last
  Mubot: With <3 from leat.io.

  leathan: !!
  Mubot: With <3 from leat.io.

  leathan: !1
  Mubot: 14

  leathan: mubot delete all
  Mubot: Deleted 2 logged evals and 0 saved evals.

  leathan: !`'7' + '7'`
  Mubot: 77

  leathan: save 1 !two sevens
  Mubot: `'7' + '7'` saved as "two sevens".

  leathan: !two sevens
  Mubot: 77

  leathan: !delete 1
  Mubot: Deleted 1 log eval.

  leathan: mubot evals
  Mubot: (0)

  leathan: mubot evals saved
  Mubot: (1) `'7' + '7'`
  
```

# Dependancies
Hubot or Mubot
