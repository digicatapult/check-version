import fsPromises from 'fs/promises'
import { z } from 'zod'


const packageParser = z.object({
    version: z.string()
})

export default class NPMPackageHandler {

    constructor(
        private fs: typeof fsPromises,

    ) {
        this.fs = fs
    }


    async scan(location: string) {
        const files = ['package-lock.json', 'package.json']
        let versions = { packageJson: '', packageJsonLock: '' }
        //read and assign files
        for (const fileName of files) {
            const contents = await this.fs.readFile(location + fileName, 'utf8')
            const jsonData = packageParser.parse(JSON.parse(contents))
            if (jsonData) {
                fileName === 'package-lock' ?
                    versions['packageJsonLock'] = jsonData['version'] :
                    versions['packageJson'] = jsonData['version']

            }
        }

        return versions
    }


}