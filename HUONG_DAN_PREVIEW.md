# THE LOST ELEPHANT ARCHIVE — Epilogue Preview (Demo 3)

**Đây là bản cập nhật CHỈ GỒM 3 FILE MÃ NGUỒN.** Không cần tải lại ảnh hay thay `index.html`.

## 1. Cập nhật qua GitHub Desktop

1. Mở GitHub Desktop, chọn repository **tdstkndemo3.github.io**, nhánh `main`.
2. Vào **Repository → Show in Explorer**.
3. Giải nén file `Epilogue_Preview_Patch.zip` ra **một thư mục khác**.
4. Mở thư mục đã giải nén. **Sao chép hai thư mục `css` và `js`** vào thư mục gốc repository trên máy. Chấp nhận **Replace files in the destination** nếu Windows hỏi. Đừng chỉ chọn các file rồi thả tất cả ra ngoài thư mục gốc.
5. Quay lại GitHub Desktop. Bạn sẽ thấy 3 file thay đổi: `css/epilogue.css`, `js/router.js`, `js/screens/Epilogue.js`.
6. Summary: `Add isolated Epilogue Preview mode`. Chọn **Commit to main**, rồi **Push origin**.
7. Mở GitHub → **Actions**, chờ lần triển khai Pages mới hoàn tất.

## 2. Link mở trực tiếp Epilogue Preview

**https://mapleleaf3637-design.github.io/tdstkndemo3.github.io/#/epilogue-preview**

- Link `.../tdstkndemo3.github.io/` vẫn vào Prologue như trước.
- Link `.../#/epilogue` vẫn bị khóa cho đến khi Stage 1, Stage 2 và cả 6 nhánh kiến thức hoàn thành thật.
- Link `.../#/epilogue-preview` mở ngay phần kết để chơi thử. Khi mở lại từ đầu, lượt thử được đặt lại.
- Dòng chữ **XEM THỬ · KHÔNG LƯU** giúp phân biệt với phần kết thật.
- Chọn sai câu hỏi vẫn có thể thử lại. Ba thông điệp cuối đều hợp lệ. SKIP không bỏ qua câu hỏi hoặc lựa chọn.
- Màn kết hiển thị **6/6 (MÔ PHỎNG)**. Không sửa `completedStages`, `unlockedBranches`, `finalQuestionCompleted`, `finalMessageChoice` hoặc `epilogueCompleted` của dữ liệu đã lưu.
- Nút **XEM LẠI MINDMAP** hoặc **VỀ TRANG CHỦ** trở về Archive của game chính.

## 3. Khắc phục nếu trang chưa cập nhật

- Trên máy tính: **Ctrl + Shift + R**, hoặc mở đường dẫn preview bằng cửa sổ ẩn danh.
- Kiểm tra trên GitHub các file được đặt **đúng** trong `css/`, `js/`, `js/screens/` (không phải ở ngoài cùng).
- Không cần đổi Settings → Pages.

## 4. Thay đổi trong code

- `js/router.js`: bổ sung route `epilogue-preview`, **không ghi `currentStage`** khi xem trước.
- `js/screens/Epilogue.js`: chạy cùng bộ scene và giao diện, dùng **biến phiên thử trong RAM** thay vì ghi tiến độ thật, giữ điều kiện khóa của route `epilogue` chính.
- `css/epilogue.css`: nhãn Preview và lưu ý 6/6 chỉ là mô phỏng, responsive cho màn hình ngang.

**Ghi chú học thuật:** Tư liệu NOW vẫn hiển thị trạng thái cần xác minh nguồn trong màn Then & Now. Bản Preview không thay thế bước hoàn thiện nguồn trích dẫn trước khi công bố.
