import * as fs from 'fs'
import * as path from 'path'

const util = {
    ensureDir: function (dir) {
        if (fs.existsSync(dir)) {
            return;
        }
        var parent = path.dirname(dir)
        this.ensureDir(parent)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir)
        }
    }
}

export default util