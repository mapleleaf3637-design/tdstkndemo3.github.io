import { imagePathFor } from '../config.js';

/** Story copy is intentionally separated from rendering and navigation logic. */
export const prologueScenes = [
  {
    id: 'forgotten-world',
    title: 'Một thế giới bị lãng quên',
    image: imagePathFor(1),
    effect: 'opening',
    dialogue: [
      { speaker: 'NHẬT KÝ NGHIÊN CỨU', text: 'Hành tinh KEP-207. Năm 2060.' },
      { speaker: 'NHẬT KÝ NGHIÊN CỨU', text: 'Bạn là một nhà sinh vật học, chuyên nghiên cứu những loài sinh vật đã biến mất khỏi thế giới của mình.' },
    ],
  },
  {
    id: 'extinct-species',
    title: 'Loài sinh vật đã biến mất',
    image: imagePathFor(2),
    effect: 'fade',
    status: ['SPECIES STATUS: EXTINCT'],
    dialogue: [
      { speaker: 'HỒ SƠ SINH HỌC', text: 'Trên KEP-207, loài voi đã tuyệt chủng từ lâu.' },
      { speaker: 'HỒ SƠ SINH HỌC', text: 'Những gì còn sót lại chỉ là hình ảnh và những hồ sơ nghiên cứu cũ.' },
    ],
  },
  {
    id: 'unknown-signal',
    title: 'Tín hiệu không xác định',
    image: imagePathFor(3),
    effect: 'signal',
    dialogue: [
      { speaker: 'CẢNH BÁO HỆ THỐNG', text: 'Khoan đã... Phòng thí nghiệm vừa nhận được một tín hiệu lạ.' },
      { speaker: 'CẢNH BÁO HỆ THỐNG', text: 'Nguồn phát đến từ một vũ trụ khác. Và trong đó... có hình ảnh của loài voi!' },
    ],
  },
  {
    id: 'another-universe',
    title: 'Một vũ trụ khác',
    image: imagePathFor(4),
    effect: 'portal',
    dialogue: [
      { speaker: 'NHẬT KÝ KHÁM PHÁ', text: 'Ở phía bên kia cánh cổng là Trái Đất — một thế giới nơi loài voi vẫn còn tồn tại.' },
      { speaker: 'NHẬT KÝ KHÁM PHÁ', text: 'Nhưng điều gì đã khiến loài vật này trở nên đặc biệt đến vậy?' },
    ],
  },
  {
    id: 'central-highlands',
    title: 'Voi và Tây Nguyên',
    image: imagePathFor(5),
    effect: 'warm',
    dialogue: [
      { speaker: 'DỮ LIỆU TỪ TRÁI ĐẤT', text: 'Tín hiệu dẫn bạn đến Tây Nguyên, Việt Nam — vùng đất gắn liền với những câu chuyện về voi.' },
      { speaker: 'DỮ LIỆU TỪ TRÁI ĐẤT', text: 'Với nhiều cộng đồng như người Mnông, Êđê và Giarai, voi không chỉ là tài sản quý mà còn được coi như thành viên trong gia đình.' },
    ],
  },
  {
    id: 'museum-archive',
    title: 'Tư liệu bảo tàng',
    image: imagePathFor(6),
    effect: 'fade',
    dialogue: [
      { speaker: 'TƯ LIỆU BẢO TÀNG', text: 'Tại Bảo tàng Dân tộc học Việt Nam, trưng bày “Voi ở Tây Nguyên” lưu giữ những hiện vật, hình ảnh và câu chuyện về mối quan hệ giữa voi và con người.' },
      { speaker: 'TƯ LIỆU BẢO TÀNG', text: 'Những tư liệu ấy kể về tập tính tự nhiên của voi, cũng như những tri thức, phong tục và giá trị văn hóa gắn với chúng.' },
    ],
  },
  {
    id: 'ama-kong',
    title: 'Di sản của Ama Kông',
    image: imagePathFor(7),
    effect: 'fade',
    dialogue: [
      { speaker: 'HỒ SƠ DI SẢN', text: 'Một phần quan trọng của trưng bày đến từ bộ vật dụng của ông Y Prông Êban, thường được biết đến với tên gọi Ama Kông.' },
      { speaker: 'HỒ SƠ DI SẢN', text: 'Năm 2014, con trai ông đã trao tặng gần 30 hiện vật cho bảo tàng, với mong muốn gìn giữ và giới thiệu di sản của gia đình và người Mnông.' },
    ],
  },
  {
    id: 'fragmented-archive',
    title: 'Dữ liệu bị phân mảnh',
    image: imagePathFor(8),
    effect: 'signal',
    status: ['ARCHIVE STATUS: INCOMPLETE', 'KNOWLEDGE RESTORED: 0/6'],
    dialogue: [
      { speaker: 'THÔNG BÁO HỆ THỐNG', text: 'Tuy nhiên, dữ liệu truyền về KEP-207 đã bị phân mảnh.' },
      { speaker: 'THÔNG BÁO HỆ THỐNG', text: 'Sáu nhánh kiến thức vẫn chưa được phục dựng. Những mảnh thông tin đang chờ bạn kết nối lại.' },
    ],
  },
  {
    id: 'journey-begins',
    title: 'Hành trình bắt đầu',
    image: imagePathFor(9),
    effect: 'reveal',
    dialogue: [
      { speaker: 'NHẬT KÝ NGHIÊN CỨU', text: 'Có lẽ chỉ biết loài voi từng tồn tại là chưa đủ...' },
      { speaker: 'NHẬT KÝ NGHIÊN CỨU', text: 'Để hiểu chúng đã sống như thế nào và vì sao chúng lại quan trọng đối với con người, bạn cần khám phá những dấu vết còn lại.' },
      { speaker: 'LỜI MỜI TỪ KHO LƯU TRỮ', text: 'Hãy kết nối các bằng chứng và phục dựng bản đồ tri thức đã thất lạc.' },
    ],
  },
];
