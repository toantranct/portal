const mysql = require("mysql");
const configOfDatabase = require('./configDatabase')

// 运行 SQL 并返回 DB 结果
function getDataFromDB(sqlArray, isSingleValue) {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection(configOfDatabase)
        connection.connect()
        console.log('---- SQL', sqlArray.join(' '))

        connection.query(sqlArray.join(' '), [], function (err, result) {
            if (err) {
                console.log('数据库请求错误', err.message)
                return reject(err)
            }
            if (isSingleValue){
                resolve(result[0])
            } else {
                resolve(result)
            }
        })
        connection.end()
    })
}


// 格式化时间，输出字符串
function dateFormatter(date, formatString) {
    formatString = formatString || 'yyyy-MM-dd hh:mm:ss'
    let dateRegArray = {
        "M+": date.getMonth() + 1,                      // 月份
        "d+": date.getDate(),                           // 日
        "h+": date.getHours(),                          // 小时
        "m+": date.getMinutes(),                        // 分
        "s+": date.getSeconds(),                        // 秒
        "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
        "S": date.getMilliseconds()                     // 毫秒
    }
    if (/(y+)/.test(formatString)) {
        formatString = formatString.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))
    }
    for (let section in dateRegArray) {
        if (new RegExp("(" + section + ")").test(formatString)) {
            formatString = formatString.replace(RegExp.$1, (RegExp.$1.length === 1) ? (dateRegArray[section]) : (("00" + dateRegArray[section]).substr(("" + dateRegArray[section]).length)))
        }
    }
    return formatString
}

// TODO: js 处理 unicode 表情编码
/*
 * unicode -> text
 */
function unicodeEncode(str){
    if(!str)return '';
    if(typeof str !== 'string') return str

    let text = JSON.stringify(str);
    text.replaceAll("/(\\\u[ed][0-9a-f]{3})/i", () => {
        // return addslashes($str[0])
    })
    return JSON.parse(text);
}

/**
 * text -> unicode
 */
function  unicodeDecode(str)
{
    let text = JSON.stringify(str);
    text.replaceAll('/\\\\\\\\/i', ()=>{
        return '\\'
    })
    return JSON.parse(text);
}


module.exports = {
    getDataFromDB, dateFormatter
}
