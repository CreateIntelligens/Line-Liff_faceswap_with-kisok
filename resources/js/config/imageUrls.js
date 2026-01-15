// 使用 Vite 的 import 語法來導入圖片，建置時會自動處理雜湊
import step1Img from '../../images/step1.png'
import step2InactiveImg from '../../images/step2_inactive.png'
import step2InprogressImg from '../../images/step2_inprogress.png'
import step3InactiveImg from '../../images/step3_inactive.png'
import step3InprogressImg from '../../images/step3_inprogress.png'
import finishImg from '../../images/finish.png'
import horizontalImg from '../../images/horizontal.png'
// 大同品牌模板圖片
import godofwealthImg from '../../images/1godofwealth.png'
import baseballImg from '../../images/2baseball.png'
import ricecookerImg from '../../images/3ricecooker.png'
import moonblocksImg from '../../images/4moonblocks.png'
import backImg from '../../images/back.png'
import logo1Img from '../../images/logo-2.png'
import newLogoImg from '../../images/logo-32ec7d19.png'
import uploadImg from '../../images/upload.png'
import pageBgImg from '../../images/page_bg.png'
import kiosktitle1Img from '../../images/kiosktitle1.png'
import title1Img from '../../images/title1.png'
import title2Img from '../../images/title2.png'
import title3Img from '../../images/title3.png'
import kiosk1Img from '../../images/kiosk1.png'
import kiosk2Img from '../../images/kiosk2.png'
import kiosk2_1Img from '../../images/kiosk2_1.png'
import kioskTextImg from '../../images/kiosk_text.png'
import homepageImg from '../../images/homepage.png'
import kioskHomepageImg from '../../images/kioskhomepage.png'
import placeemailImg from '../../images/placeemail.png'
import couponImg from '../../images/coupon.png'
import maintitleImg from '../../images/maintitle.png'
import historyImg from '../../images/history.png'

// 使用 Vite 的安全 import 語法來獲取圖片 URL，建置時會自動處理雜湊
export const imageUrls = {
  // 步驟圖片
  step1: step1Img,
  step2_inactive: step2InactiveImg,
  step2_inprogress: step2InprogressImg,
  step3_inactive: step3InactiveImg,
  step3_inprogress: step3InprogressImg,
  finish: finishImg,
  horizontal: horizontalImg,

  // 大同品牌模板圖片
  play: godofwealthImg,      // 財運亨通馬上發
  wife: baseballImg,         // 強棒出擊馬力夯
  love: ricecookerImg,       // 山珍海味馬不停
  super: moonblocksImg,      // 心想事成馬上有

  // 其他圖片
  back: backImg,
  header: logo1Img,
  header1: logo1Img,  // 新增別名
  logo: newLogoImg,
  profile: godofwealthImg,   // 首頁主圖使用財神爺
  prize: godofwealthImg,     // 獎品圖使用財神爺
  load: godofwealthImg,      // 載入圖使用財神爺
  result: godofwealthImg,    // 結果圖使用財神爺
  upload: uploadImg,
  pageBg: pageBgImg,        // 頁面背景圖
  kiosktitle1: kiosktitle1Img,  // Kiosk 版標題圖片
  title1: title1Img,            // 手機版標題圖片
  title2: title2Img,            // 上傳圖片標題
  title3: title3Img,            // 生成結果標題
  kiosk1: kiosk1Img,            // Kiosk 模式：需使用單人清晰正面照
  kiosk2: kiosk2Img,            // Kiosk 模式：拍照倒數中，請勿移動
  kiosk2_1: kiosk2_1Img,        // Kiosk 模式：請確認照片
  kioskText: kioskTextImg,      // Kiosk 模式：拍照說明文字
  homepage: homepageImg,        // 手機版首頁圖片
  kioskHomepage: kioskHomepageImg,  // Kiosk 版首頁圖片
  placeemail: placeemailImg,    // Email 提示文字圖片
  coupon: couponImg,            // Email 使用說明圖片（畫面下方）
  maintitle: maintitleImg,      // 主標題圖片（大同寶寶賀新年）
  history: historyImg,          // 圖片生成紀錄標題
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
  play: imageUrls.play,      // 財運亨通馬上發
  wife: imageUrls.wife,      // 強棒出擊馬力夯
  love: imageUrls.love,      // 山珍海味馬不停
  super: imageUrls.super,    // 心想事成馬上有
};

// 其他圖片集合 (兼容 images.js 的 API)
export const otherImages = {
  back: imageUrls.back,
  header: imageUrls.header,
  logo: imageUrls.logo,
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
    '1': imageUrls.play,   // 財運亨通馬上發
    '2': imageUrls.wife,   // 強棒出擊馬力夯
    '3': imageUrls.love,   // 山珍海味馬不停
    '4': imageUrls.super,  // 心想事成馬上有
    'play': imageUrls.play,
    'wife': imageUrls.wife,
    'love': imageUrls.love,
    'super': imageUrls.super,
  };

  return imageMap[templateId] || imageUrls.play;
};