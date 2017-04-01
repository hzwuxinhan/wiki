import * as fs from 'fs'
import * as path from 'path'

function type(o) {
    var _type = Array.isArray(o) ? 'array' : (o === null) ? 'null' : typeof o;
    if (_type == 'number') {
        _type = /^\d+\.\d+$/.test(o) ? 'float' : 'int';
    }
    return _type;
}

export default function generateData(sourceData) {
     return generate(sourceData);
}

function generate(dataItem) {
    if(dataItem === null) return;
    let _type = dataItem.type ? dataItem.type : type(dataItem);
    let generated = null;
    switch (_type) {
        case 'object':
            generated = {};
            if (dataItem.properties) {
                let Items = dataItem.properties;
                for (let p in Items) {
                    generated[p] = generate(Items[p]);
                }
            } else {
                for (let p in dataItem) {
                    generated[p] = generate(dataItem[p]);
                }
                // console.log(generated);
            }
            break;
        case 'string':
            generated = '我是String来的';
            break;
        case 'number':
            generated = 100;
            break;
        case 'array':
            generated = [];
            if (dataItem.items) {
                const Items = dataItem.items;
                for (let i =0 ;i < 5; i++) {
                    generated[i] = generate(Items);
                }
            } else {
                for (let i = 0; i < dataItem.length; i++) {
                    generated[i] = generate(dataItem[i]);
                }
            }
            break;
        case 'boolean':
            generated = true;
            break;
        default:
            generated = dataItem;
            break;
    }
    return generated;
}
