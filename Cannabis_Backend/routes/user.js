const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const { verify } = require('./middlewares');
const User = require('../models').User;

router.get('/img/:nickname', async (req, res, next)=> {
    try {
        let user = await User.findOne({
            where: {nickname: req.params.nickname}
        });
        res.send(`http://${process.env.HOST}:5000/${user.profile}`);
    } catch (e) {
        next(e);
    }
});

router.get('/nick', (req,res)=>{
    let token = req.cookies.token;
    let userInfo = verify(token);
    res.send(userInfo.nickname);
});

router.get('/real', (req, res)=>{
    let token = req.cookies.token;
    let userInfo = verify(token);
    res.send(userInfo.realname);
});

router.get('/yam', (req, res)=>{
    let token = req.cookies.token;
    let userInfo = verify(token);
    res.send(String(userInfo.yam));
});

fs.readdir('uploads', (error)=>{
    if (error) {
        console.error('uploads 폴더가 없어 uploads 폴더를 서버의 디스크에 생성합니다');
        fs.mkdirSync('uploads');
    }
});

let upload = multer({
    storage: multer.diskStorage({
        // 파일 저장 경로 설정
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname) + ext);
        }
        ,
        // 파일 사이즈 제한 설정
        limits: {fileSize: 5 * 1024 * 1024}
    })
});

router.post('/dev/img', upload.single('img'), async (req, res)=> {
//    console.log(req.file);
    res.json({ url : `http://${process.env.HOST}:5000/${req.file.filename}`});
});

module.exports = router;