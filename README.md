# mubot-eval
Records and saves code evaluations from chatrooms. (Mubots eval command integration for Hubot.)

There are 2 modes. One which is a fork of a hubot scripts package. and the other directly evaluates code against the live robot code. That is to say the in memory values are directly alterable and also system access equivilant to the bots process. *Do not* add power users that are not you or people you trust with full system access.

# Usage

```
  leathan: mubot `7+7`
  Mubot: 14

  leathan: mubot `(()=>"With <3 from leat.io.")`
  Mubot: With <3 from leat.io.
```

# Dependancies
Hubot or Mubot
