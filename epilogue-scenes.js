/**
 * EPILOGUE DATA - all text and evidence metadata live here, not in the UI.
 * All URLs are document-relative and work under a GitHub Pages project path.
 * All seven supplied illustrations are now included, including epilogue_05.png.
 * Scene 5 uses its own image; epilogue_04.png remains a safety fallback if the new file fails to load.
 */
const ASSET_DIR = './assets/epilogue/';
export const epilogueImage = (fileName) => `${ASSET_DIR}${fileName}`;

export const EPILOGUE_SCENES = Object.freeze({
  scene1: {
    chapter: '01 / THE COMPLETE ARCHIVE',
    image: epilogueImage('epilogue_01.png'),
    dialogue: [
      'Cuối cùng, sáu mảnh tri thức đã được kết nối. Hồ sơ về loài voi đã được phục dựng.',
      'Bạn đã khám phá cách voi sinh sống, lịch sử con người chung sống với chúng và vị trí đặc biệt của voi trong đời sống Tây Nguyên.',
      'Nhưng khi nhìn lại hồ sơ, bạn nhận ra một điều: sự tồn tại của loài voi không chỉ có ý nghĩa đối với tự nhiên, mà còn đối với ký ức và văn hóa của con người.',
    ],
  },
  scene2: {
    chapter: '02 / THEN & NOW',
    image: epilogueImage('epilogue_02.png'),
    dialogue: [
      'Qua thời gian, mối quan hệ giữa con người và voi đã và đang thay đổi.',
      'Những tư liệu về quá khứ và hiện tại cho thấy một câu chuyện đáng suy ngẫm. Hãy cùng đối chiếu chúng.',
    ],
  },
  scene4: {
    chapter: '04 / THE LAST MESSAGE',
    image: epilogueImage('epilogue_04.png'),
    dialogue: [
      'Hệ thống đã sẵn sàng truyền dữ liệu về KEP-207.',
      'Nhưng những gì bạn tìm thấy không chỉ là kiến thức về một loài vật đã biến mất khỏi thế giới của mình.',
      'Nếu được gửi một thông điệp đến những người chưa từng nhìn thấy voi, bạn sẽ nói gì?',
    ],
  },
  scene5: {
    chapter: '05 / ARCHIVE TRANSMITTED',
    image: epilogueImage('epilogue_05.png'),
    fallbackImage: epilogueImage('epilogue_04.png'),
    dialogue: [
      'Truyền dữ liệu hoàn tất.',
      'Hồ sơ về loài voi đã được khôi phục. Nhưng trên KEP-207, những con voi vẫn chỉ còn tồn tại trong ký ức.',
      'Bạn không thể thay đổi những gì đã mất trong thế giới của mình. Nhưng ở Trái Đất, vẫn còn cơ hội để bảo vệ loài voi và những giá trị gắn liền với chúng.',
      'Bởi khi một loài biến mất, điều chúng ta đánh mất có thể lớn hơn nhiều so với những gì từng nhận ra.',
    ],
  },
});

/**
 * Source metadata is editable without changing HTML/CSS.
 * NOTE: source.status === 'needs-verification' is deliberately visible in the game.
 * Do not pretend a conceptual illustration is a historical photograph.
 */
export const EPILOGUE_EVIDENCE = Object.freeze([
  {
    id: 'then',
    eyebrow: 'TRƯỚC ĐÂY · THEN',
    name: 'Lao động và sinh kế',
    image: epilogueImage('then_evidence.png'),
    imageAlt: 'Minh họa voi tham gia vận chuyển hàng hóa cùng một người đi đường trong khung cảnh Tây Nguyên xưa.',
    description: 'Trong đời sống truyền thống ở Tây Nguyên, voi từng được sử dụng để vận chuyển hàng hóa, kéo gỗ và tham gia những hoạt động kinh tế khác.',
    source: {
      title: 'Trưng bày Voi ở Tây Nguyên – Bảo tàng Dân tộc học Việt Nam',
      year: null,
      url: null,
      status: 'exhibition',
    },
  },
  {
    id: 'now',
    eyebrow: 'HIỆN NAY · NOW',
    name: 'Hướng đến phúc lợi voi',
    image: epilogueImage('now_evidence.png'),
    imageAlt: 'Minh họa nhóm du khách quan sát một con voi từ khoảng cách an toàn trong rừng.',
    description: 'Một số mô hình du lịch thân thiện với voi hướng đến việc quan sát voi trong môi trường sống, hạn chế các hoạt động gây ảnh hưởng đến phúc lợi của chúng.',
    source: {
      title: 'Thông tin bảo tồn hiện đại — cần bổ sung nguồn đã kiểm chứng',
      year: null,
      url: null,
      status: 'needs-verification',
    },
  },
]);

export const FINAL_DISCOVERY = Object.freeze({
  heading: 'THE FINAL DISCOVERY',
  question: 'Hai tư liệu Then & Now cho thấy điều gì về mối quan hệ giữa con người và voi?',
  options: [
    { id: 'A', text: 'Voi đã không còn giá trị đối với đời sống con người.' },
    { id: 'B', text: 'Cách con người sử dụng và chăm sóc voi có thể thay đổi, trong khi các giá trị văn hóa và trách nhiệm bảo vệ voi vẫn cần được quan tâm.' },
    { id: 'C', text: 'Bảo tồn voi đồng nghĩa với việc phải chấm dứt mọi hoạt động văn hóa liên quan đến voi.' },
  ],
  correctId: 'B',
  feedbackCorrect: 'Chính xác! Những giá trị kinh tế và văn hóa gắn với voi không nhất thiết phải biến mất khi cách con người đối xử với chúng thay đổi. Điều quan trọng là tìm cách gìn giữ các giá trị ấy đồng thời bảo vệ voi và môi trường sống của chúng.',
  feedbackIncorrect: 'Hãy nhìn lại hai tư liệu. Việc thay đổi cách khai thác giá trị của voi có đồng nghĩa với việc loài voi không còn quan trọng, hoặc mọi giá trị văn hóa liên quan đến voi đều phải biến mất?',
});

export const LAST_MESSAGES = Object.freeze([
  {
    id: 'life', icon: '❧', title: 'Bảo vệ sự sống',
    text: 'Mỗi loài đều có vị trí trong tự nhiên. Bảo vệ voi cũng là bảo vệ môi trường sống của chúng.',
  },
  {
    id: 'memory', icon: '▤', title: 'Gìn giữ ký ức',
    text: 'Khi một loài biến mất, những tri thức và câu chuyện văn hóa gắn với chúng cũng có nguy cơ mai một.',
  },
  {
    id: 'responsibility', icon: '♡', title: 'Chung sống có trách nhiệm',
    text: 'Con người cần tìm cách duy trì sinh kế và các giá trị văn hóa mà vẫn tôn trọng phúc lợi của voi.',
  },
]);

export function findLastMessage(id) {
  return LAST_MESSAGES.find((message) => message.id === id) || null;
}
