const express = require('express')
const configOfDatabase = require('../config/configDatabase')
const utility = require("../config/utility");
const ResponseSuccess = require("../response/ResponseSuccess");
const ResponseError = require("../response/ResponseError");
const router = express.Router()
const bcrypt = require('bcrypt')

/* GET users listing. */
router.post('/register', (req, res, next) => {
    // TODO: 验证传过来的数据库必填项
    // 判断邀请码是否正确
    if (req.body.invitation && req.body.invitation === configOfDatabase.invitation){
        checkEmailOrUserNameExist(req.body.email, req.body.username)
            .then(dataEmailExistArray => {
                // email 记录是否已经存在
                if (dataEmailExistArray.length > 0){
                    return res.send(new ResponseError('', '邮箱或用户名已被注册'))
                } else {
                    let sqlArray = []
                    let timeNow = utility.dateFormatter(new Date())
                    // 明文密码通过 bcrypt 加密，对比密码也是通过  bcrypt
                    bcrypt.hash(req.body.password, 10, (err, encryptPassword) => {
                        sqlArray.push(
                            `insert into users(email, nickname, username, password, register_time, last_visit_time, comment, 
                                                wx, phone, homepage, gaode, group_id)
                                    VALUES (
                                    '${req.body.email}', 
                                    '${req.body.nickname}', 
                                    '${req.body.username}', 
                                    '${encryptPassword}', 
                                    '${timeNow}',
                                    '${timeNow}',
                                    '${req.body.comment || ''}', 
                                    '${req.body.wx}', 
                                    '${req.body.phone}', 
                                    '${req.body.homepage}', 
                                    '${req.body.gaode}', 
                                    '${req.body.group_id}'
                                    )`
                        )
                        utility.getDataFromDB(sqlArray)
                            .then(data => {
                                res.send(new ResponseSuccess('', '注册成功'))
                            })
                            .catch(err => {
                                res.send(new ResponseError(err.message, '注册失败'))
                            })
                    })

                }
            })
            .catch(errEmailExist => {
                console.log(errEmailExist)
                res.send(new ResponseError(errEmailExist, '查询出错'))
            })

    } else {
        res.send(new ResponseError('', '邀请码错误'))
    }


})

// 检查用户名或邮箱是否存在
function checkEmailOrUserNameExist(email, username){
    let sqlArray = []
    sqlArray.push(`select * from users where email='${email}' or username ='${username}'`)
    return utility.getDataFromDB(sqlArray)
}


router.post('/login', (req, res, next) => {
    let sqlArray = []
    sqlArray.push(`select * from users where email = '${req.body.email}'`)

    utility.getDataFromDB(sqlArray, true)
        .then(data => {
            bcrypt.compare(req.body.password, data.password, function(err, isPasswordMatch) {
                if (isPasswordMatch){
                    utility.updateUserLastLoginTime(req.body.email)
                    res.send(new ResponseSuccess(data,'登录成功'))
                } else {
                    res.send(new ResponseError('','用户名或密码错误'))
                }
            })
        })
        .catch(err => {
            res.send(new ResponseError(err.message))
        })
})

// 修改密码
router.put('/change-password', (req, res, next) => {
    let sqlArray = []
    sqlArray.push(`select * from users where email = '${req.body.email}'`)

    utility.getDataFromDB(sqlArray, true)
        .then(data => {
            // 1. 如果存在该用户
            if (data){
                // 2. 判断加密后的密码是否跟数据库中的 token 一致
                bcrypt.compare(req.body.passwordOld, data.password, function(err, isPasswordMatch) {
                    if (isPasswordMatch){
                        // 3. 加密新密码，执行数据库密码更新操作
                        bcrypt.hash(req.body.passwordNew, 10, (err, encryptPasswordNew) => {
                            let changePasswordSqlArray = [`update users set password = '${encryptPasswordNew}' where email='${req.body.email}'`]
                            utility.getDataFromDB(changePasswordSqlArray)
                                .then(dataChangePassword => {
                                    utility.updateUserLastLoginTime(req.body.email)
                                    res.send(new ResponseSuccess('', '修改密码成功'))
                                })
                                .catch(errChangePassword => {
                                    res.send(new ResponseError('', '修改密码失败'))
                                })
                        })
                    } else {
                        res.send(new ResponseError('', '原密码错误'))
                    }
                })

            } else {
                res.send(new ResponseError('', '无此用户'))
            }

        })
        .catch(err => {
            res.send(new ResponseError(err.message))
        })
})


module.exports = router
