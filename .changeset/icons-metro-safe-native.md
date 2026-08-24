---
"@plyxui/icons": patch
---

Metro-safe native build: the native Icon now imports react-native-svg
statically instead of lazily requiring it. The lazy require compiled
into an ESM interop shim Metro can't bundle, crashing Expo apps at
runtime with `Requiring unknown module "react-native-svg"`. The native
entry only resolves on native platforms where react-native-svg is a
required peer, so the guard bought nothing. Apps that pointed Metro at
the package's TS source as a workaround can remove that resolver
override.
