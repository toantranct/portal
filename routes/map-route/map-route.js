const express = require('express')
const router = express.Router()
const utility = require('../../config/utility')
const ResponseSuccess = require('../../response/ResponseSuccess')
const ResponseError = require('../../response/ResponseError')
const CURRENT_DATABASE = 'map_route'


router.get('/list', (req, res, next) => {
    utility
        .verifyAuthorization(req)
        .then(userInfo => {
            let sqlArray = []
            sqlArray.push(`select  
                                ${CURRENT_DATABASE}.name, 
                                ${CURRENT_DATABASE}.area, 
                                ${CURRENT_DATABASE}.road_type, 
                                ${CURRENT_DATABASE}.seasons, 
                                ${CURRENT_DATABASE}.video_link, 
                                ${CURRENT_DATABASE}.paths, 
                                ${CURRENT_DATABASE}.note, 
                                ${CURRENT_DATABASE}.date_init, 
                                ${CURRENT_DATABASE}.date_modify, 
                                ${CURRENT_DATABASE}.thumb_up, 
                                ${CURRENT_DATABASE}.uid,
                               users.phone,
                               users.wx,
                               users.uid,
                               users.nickname,
                               users.username
                                    from ${CURRENT_DATABASE}
                                        left join users on ${CURRENT_DATABASE}.uid = users.uid
                            `)



            if (userInfo.group_id === 1){

            } else {
                sqlArray.push([`where qrs.uid = ${userInfo.uid}`])
            }


            // keywords
            if (req.query.keywords){
                let keywords = JSON.parse(req.query.keywords).map(item => utility.unicodeEncode(item))
                console.log(keywords)
                if (keywords.length > 0){
                    let keywordStrArray = keywords.map(keyword => `( name like '%${keyword}%' ESCAPE '/'  or note like '%${keyword}%' ESCAPE '/')` )
                    sqlArray.push(' and ' + keywordStrArray.join(' and ')) // 在每个 categoryString 中间添加 'or'
                }
            }

            let startPoint = (req.query.pageNo - 1) * req.query.pageSize //  路线 起点
            sqlArray.push(` order by date_init desc
                  limit ${startPoint}, ${req.query.pageSize}`)

            utility
                .getDataFromDB( 'diary', sqlArray)
                .then(data => {
                    utility.updateUserLastLoginTime(userInfo.uid)
                    data.forEach(diary => {
                        // decode unicode
                        diary.message = utility.unicodeDecode(diary.message)
                        diary.description = utility.unicodeDecode(diary.description)
                    })
                    res.send(new ResponseSuccess(data, '请求成功'))
                })
                .catch(err => {
                    res.send(new ResponseError(err, err.message))
                })
        })
        .catch(verified => {
            res.send(new ResponseError('无权查看 路线 列表：用户信息错误'))
        })
})

router.get('/detail', (req, res, next) => {
    let sqlArray = []
    sqlArray.push(`select * from ${CURRENT_DATABASE} where id = '${req.query.id}'`)
    utility
        .getDataFromDB( 'diary', sqlArray, true)
        .then(dataRoute => {
            // decode unicode
            dataRoute.message = utility.unicodeDecode(dataRoute.message)
            dataRoute.description = utility.unicodeDecode(dataRoute.description)

            // 2. 判断是否为共享 路线
            if (dataRoute.is_public === 1){
                // 2.1 如果是，直接返回结果，不需要判断任何东西
                res.send(new ResponseSuccess(dataRoute))
            } else {
                // 2.2 如果不是，需要判断：当前 email 和 token 是否吻合
                utility
                    .verifyAuthorization(req)
                    .then(userInfo => {
                        // 3. 判断 路线 是否属于当前请求用户
                        if (Number(userInfo.uid) === dataRoute.uid){
                            // 记录最后访问时间
                            utility.updateUserLastLoginTime(userInfo.uid)
                            res.send(new ResponseSuccess(dataRoute))
                        } else {
                            res.send(new ResponseError('','当前用户无权查看该 路线 ：请求用户 ID 与 路线 归属不匹配'))
                        }
                    })
                    .catch(unverified => {
                        res.send(new ResponseError('','当前用户无权查看该 路线 ：用户信息错误'))
                    })
            }
        })
        .catch(err => {
            res.send(new ResponseError(err, err.message))
        })
})

router.post('/add', (req, res, next) => {
    // 1. 验证用户信息是否正确
    utility
        .verifyAuthorization(req)
        .then(userInfo => {
            // 2. 检查路线名是否已存在
            checkRouteExist(req.body.name)
                .then(existLogs => {
                    console.log(existLogs)
                    if (existLogs.length > 0) {
                        // 2.1 已存在名为 hash 的记录
                        res.send(new ResponseError('', `已存在名为 ${req.body.name} 的路线`))
                    } else {
                        // 2.2 不存在名为 hash 的记录
                        let sqlArray = []
                        let parsedMessage = utility.unicodeEncode(req.body.message) // !
                        let parsedDescription = utility.unicodeEncode(req.body.description) || ''
                        let timeNow = utility.dateFormatter(new Date())
                        sqlArray.push(`
                           insert into ${CURRENT_DATABASE}(name, area, road_type, seasons, video_link, paths, note, date_init, date_modify, thumb_up, uid)
                            values(
                                '${req.body.name}',
                                '${req.body.area || ""}',
                                '${req.body.road_type || ""}',
                                '${req.body.seasons || ""}',
                                '${req.body.video_link || ""}',
                                '${req.body.paths}',
                                '${req.body.note || ""}',
                                '${timeNow}',
                                '${timeNow}',
                                '${req.body.thumb_up}',
                                '${userInfo.uid}'
                                )
                        `)
                        utility
                            .getDataFromDB( 'diary', sqlArray)
                            .then(data => {
                                utility.updateUserLastLoginTime(userInfo.uid)
                                res.send(new ResponseSuccess({id: data.insertId}, '添加成功')) // 添加成功之后，返回添加后的 路线  id
                            })
                            .catch(err => {
                                console.log(err)
                                res.send(new ResponseError(err, '添加失败'))
                            })
                    }
                })
                .catch(err => {
                    res.send(new ResponseError(err, '查询路径记录出错'))
            })

        })
        .catch(err => {
            res.send(new ResponseError(err, '无权操作'))
        })
})

// 检查用户名或邮箱是否存在
function checkRouteExist(routeName){
    let sqlArray = []
    sqlArray.push(`select * from map_route where name='${routeName}'`)
    return utility.getDataFromDB( 'diary', sqlArray)
}


router.put('/modify', (req, res, next) => {

    // 1. 验证用户信息是否正确
    utility
        .verifyAuthorization(req)
        .then(userInfo => {
            let parsedMessage = utility.unicodeEncode(req.body.message) // !
            let parsedDescription = utility.unicodeEncode(req.body.description) || ''
            let timeNow = utility.dateFormatter(new Date())

            let sqlArray = []
            sqlArray.push(`
                        update qrs
                            set
                                qrs.is_public = '${req.body.is_public}',
                                qrs.is_show_phone = '${req.body.is_show_phone}',
                                qrs.message = '${parsedMessage}',
                                qrs.description = '${parsedDescription}',
                                qrs.car_name = '${req.body.car_name}',
                                qrs.car_plate = '${req.body.car_plate}',
                                qrs.car_desc = '${req.body.car_desc}',
                                qrs.is_show_car = '${req.body.is_show_car}',
                                qrs.is_show_wx = '${req.body.is_show_wx}',
                                qrs.wx_code_img = '${req.body.wx_code_img}',
                                qrs.is_show_homepage = '${req.body.is_show_homepage}',
                                qrs.is_show_gaode = '${req.body.is_show_gaode}',
                                qrs.date_modify = '${timeNow}',
                                qrs.visit_count = '${req.body.visit_count}',
                                qrs.uid = '${req.body.uid}',
                                qrs.imgs = '${req.body.imgs}',
                                qrs.car_type = '${req.body.car_type}'
                            WHERE hash='${req.body.id}'
                    `)

            utility
                .getDataFromDB( 'diary', sqlArray, true)
                .then(data => {
                    utility.updateUserLastLoginTime(req.body.email)
                    res.send(new ResponseSuccess(data, '修改成功'))
                })
                .catch(err => {
                    res.send(new ResponseError(err, '修改失败'))
                })
        })
        .catch(err => {
            res.send(new ResponseError(err, '无权操作'))
        })
})

router.delete('/delete', (req, res, next) => {
    // 1. 验证用户信息是否正确
    utility
        .verifyAuthorization(req)
        .then(userInfo => {

            let sqlArray = []
            sqlArray.push(`
                        DELETE from ${CURRENT_DATABASE}
                        WHERE id='${req.body.id}'
                    `)
            if (userInfo.group_id !== 1){
                sqlArray.push(` and uid='${userInfo.uid}'`) // 当为1管理员时，可以随意操作任意对象
            }
            utility
                .getDataFromDB( 'diary', sqlArray)
                .then(data => {
                    if (data.affectedRows > 0) {
                        utility.updateUserLastLoginTime(userInfo.uid)
                        res.send(new ResponseSuccess('', '删除成功'))
                    } else {
                        res.send(new ResponseError('', '删除失败'))
                    }
                })
                .catch(err => {
                    res.send(new ResponseError(err,))
                })

        })
        .catch(err => {
            res.send(new ResponseError(err, '无权操作'))
        })
})

router.post('/clear-visit-count', (req, res, next) => {
    // 1. 验证用户信息是否正确
    utility
        .verifyAuthorization(req)
        .then(userInfo => {
            // 2. 是否为管理员
            if(userInfo.group_id === 1) {
                let sqlArray = []
                let timeNow = utility.dateFormatter(new Date())
                sqlArray.push(` update qrs set visit_count = 0 where hash = '${req.body.id}' `)
                utility
                    .getDataFromDB( 'diary', sqlArray)
                    .then(data => {
                        utility.updateUserLastLoginTime(userInfo.uid)
                        res.send(new ResponseSuccess('', '计数已清零')) // 添加成功之后，返回添加后的 路线  id
                    })
                    .catch(err => {
                        console.log(err)
                        res.send(new ResponseError(err, '计数清零失败'))
                    })
            } else {
                res.send(new ResponseError('', '无权操作'))
            }

        })
        .catch(err => {
            res.send(new ResponseError(err, '无权操作'))
        })
})



module.exports = router