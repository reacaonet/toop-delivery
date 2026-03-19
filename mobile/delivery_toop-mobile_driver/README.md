##

`npx jetify`

## Gerar SHA1

`keytool -list -v -keystore ./android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android`

## Gerando chave keystore

`keytool -genkey -v -alias toop -keyalg RSA -keystore production.keystore -keysize 2048 -validity 10000`

## Gerando build APK

`./gradlew assembleRelease`

## Gerando build

`./gradlew bundleRelease`

### comands create tag

`git tag`
`git tag -a v1.4 -m "my version 1.4"`
`git push origin --tags`
