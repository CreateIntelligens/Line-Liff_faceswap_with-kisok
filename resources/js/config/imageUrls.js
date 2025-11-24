// 使用 Vite 的 import 語法來導入圖片，建置時會自動處理雜湊
import step1Img from '../../images/step1.png'
import step2InactiveImg from '../../images/step2_inactive.png'
import step2InprogressImg from '../../images/step2_inprogress.png'
import step3InactiveImg from '../../images/step3_inactive.png'
import step3InprogressImg from '../../images/step3_inprogress.png'
import finishImg from '../../images/finish.png'
import horizontalImg from '../../images/horizontal.png'
import playImg from '../../images/play.png'
import wifeImg from '../../images/wife.png'
import loveImg from '../../images/love.png'
import superImg from '../../images/super.png'
import backImg from '../../images/back.png'
import crownImg from '../../images/crown.png'
import group13948Img from '../../images/Group13948.png'
import headerImg from '../../images/header.png'
import newHeaderImg from '../../images/2025內容創新發布會-KV-FIN0805 2.png'
import logoImg from '../../images/logo.png'
import logo1Img from '../../../public/images/logo-2.png'
import newLogoImg from '../../../public/images/logo.32ec7d19 1 (1).png'
import resultHeaderImg from '../../../public/images/Group 138678 (1).png'
import starImg from '../../images/star.png'
import uploadImg from '../../images/upload.png'
import rectangle8Img from '../../images/Rectangle 8.png'

// 使用 Vite 的安全 import 語法來獲取圖片 URL，建置時會自動處理雜湊
export const imageUrls = {
  // 步驟圖片
  step1: finishImg,
  step2_inactive: step2InactiveImg,
  step2_inprogress: step2InprogressImg,
  step3_inactive: step3InactiveImg,
  step3_inprogress: step3InprogressImg,
  finish: finishImg,
  horizontal: horizontalImg,

  // 模板圖片
  play: playImg,
  wife: wifeImg,
  love: loveImg,
  super: superImg,

  // 其他圖片
  back: backImg,
  crown: crownImg,
  Group13948: group13948Img,
  header: logo1Img,
  resultHeader: resultHeaderImg,
  logo: newLogoImg,
  star: starImg,
  upload: uploadImg,
  rectangle8: rectangle8Img,
};

// 步驟圖片集合 (兼容 images.js 的 API)
export const stepImages = {
  step1: imageUrls.step1,
  step2_inactive: imageUrls.step2_inactive,
  step2_inprogress: imageUrls.step2_inprogress,
  step3_inactive: imageUrls.step3_inactive,
  step3_inprogress: imageUrls.step3_inprogress,
  finish: imageUrls.finish,
  horizontal: imageUrls.horizontal,
};

// 模板圖片集合 (兼容 images.js 的 API)
export const templateImages = {
  play: imageUrls.play,
  wife: imageUrls.wife,
  love: imageUrls.love,
  super: imageUrls.super,
};

// 其他圖片集合 (兼容 images.js 的 API)
export const otherImages = {
  back: imageUrls.back,
  crown: imageUrls.crown,
  Group13948: imageUrls.Group13948,
  header: imageUrls.header,
  logo: imageUrls.logo,
  star: imageUrls.star,
  upload: imageUrls.upload,
  wife: imageUrls.wife,
};

// 所有圖片集合 (兼容 images.js 的 API)
export const allImages = {
  ...stepImages,
  ...templateImages,
  ...otherImages,
};

// 根據模板 ID 獲取圖片
export const getTemplateImage = (templateId) => {
  const imageMap = {
    '1': imageUrls.play,   // 綜藝玩很大
    '2': imageUrls.wife,   // 犀利人妻
    '3': imageUrls.love,   // 命中註定我愛你
    '4': imageUrls.super,  // 超級夜總會
    'play': imageUrls.play,
    'wife': imageUrls.wife,
    'love': imageUrls.love,
    'super': imageUrls.super,
  };

  return imageMap[templateId] || imageUrls.play;
};