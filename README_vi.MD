# 《Nhật ký tiêu đề》 Phía sau - phiên bản nodejs


## Một、Giải thích dự án
Đối tượng dịch vụ： [《Nhật ký tiêu đề》](https://github.com/KyleBing/diary-vue)

> Ví dụ đã chạy trực tuyến：
> http [http://kylebing.cn:3000/diary/detail?diaryId=6766](http://kylebing.cn:3000/diary/detail?diaryId=6766)



###
```bash
# 1. Thông tin thống kê
- /statistic # Thông tin thống kê `2022-05-12`

# 2. Quản lý nhật ký
- /diary/list
- /diary/add
- /diary/modify
- /diary/delete
- /diary/detail

    # 2.1 Thông tin danh sách thẻ ngân hàng
    - /bank-card/ # Danh sách thẻ ngân hàng `2022-05-12`
    
    # 2.2 Thông tin thống kê hóa đơn
    - /bill/ # Thông tin thống kê loại hóa đơn trong nhật ký `2022-05-24`
    - /bill/keys # Danh sách tất cả các mục hóa đơn `2023-12-20`
    - /bill/sorted # Hiển thị tất cả hóa đơn

# 3. Quản lý người dùng
- /user/
- /user/add
- /user/delete
- /user/modify
- /user/detail
- /user/list
- /user/login
- /user/change-password

# 4. Quản lý loại nhật ký
- /diary-category/ # Quản lý loại `2022-05-24`
- /diary-category/add # Quản lý loại `2022-05-24`
- /diary-category/modify # Sửa đổi loại `2022-07-22`
- /diary-category/list # Quản lý loại `2022-05-24`
- /diary-category/delete

# 5. Quản lý mã mời
- /invitation/generate # Tạo mới
- /invitation/mark-shared # Đánh dấu mã mời đã được sử dụng
- /invitation/list # Danh sách mã mời có thể sử dụng
- /invitation/delete # Xóa mã mời

# 6. Thống kê
- /statistic/ # Thống kê nhật ký, dữ liệu người dùng
- /statistic/category # Thống kê số lượng nhật ký theo loại
- /statistic/year # Thống kê nhật ký theo năm
- /statistic/users # Số lượng nhật ký, bảng mã, qr, etc. của người dùng
- /statistic/weather # Thông tin nhiệt độ của tất cả nhật ký


# 7. Dự án bảng mã `2022-04-24`
- /dict/pull
- /dict/push

# 8. Dự án mã QR `2022-05-18`
- /qr-manager/list
- /qr-manager/detail
- /qr-manager/add
- /qr-manager/modify
- /qr-manager/delete
- /qr-manager/clear-visit-count

# 9. Thông tin mã QR phía trước
- /qr-front/ # Thông tin mã `2022-05-18`

# 10. Giao diện thông tin máy chủ VPS
- /vps/ # thông tin vps

# 11. Dữ liệu đói
- /dont-starve/{tablename}/list # Dữ liệu danh sách
- /dont-starve/{tablename}/info # Dữ liệu chi tiết

# 12. Dữ liệu lộ trình
Lộ trình bản đồ
- /map-route/list
- /map-route/detail
- /map-route/add
- /map-route/modify
- /map-route/delete

Thông tin bản đồ
- /map-pointer/list
- /map-pointer/detail
- /map-pointer/add
- /map-pointer/modify
- /map-pointer/delete

```



## Hai、Hướng dẫn cài đặt

**Điều kiện cần của máy chủ：**
- Đã cài đặt `nodejs 18+`
- Đã cài đặt `npm` hoặc `yarn`
- Đã cài đặt `nginx`，cần sử dụng nó để ánh xạ đường dẫn, để truy cập phía sau không cần qua đường dẫn
- Đã cài đặt `mysql` hoặc `mariaDB`

### 1. clone hoặc tải xuống tệp dự án
Sau khi tải xuống tệp dự án, thực hiện `npm i` hoặc `yarn` để cài đặt phụ thuộc dự án

### 2. Sửa đổi tệp cấu hình cơ sở dữ liệu
Sửa đổi nội dung tệp `/config/configDatabase.js`，thay đổi thành cấu hình của bạn
```js
module.exports = {
    host:       'localhost',
    user:       '----',
    password:   '----',
    port:       '3306',
    multipleStatements: true
}
```

và tệp cấu hình dự án `/config/configProject.js`
```js
module.exports = {
   invitation: '----', // Mã mời toàn năng, sử dụng khi đăng ký
   adminCount: 'kylebing@163.com', // Tài khoản quản trị viên, người dùng này có thể xem tất cả dữ liệu thống kê người dùng trên trang thống kê
   TOKEN_NAME: 'Diary-Token', // trường token trong header, tên token đã thỏa thuận với phía trước, không cần phải sửa đổi cố ý
}
```

### 3. Khởi chạy chương trình
Ở đây, chúng tôi khuyên bạn nên sử dụng chương trình quản lý pm2, tạo dự án pm2 có tên là `diary` và khởi chạy
> Cách sử dụng pm2： [https://blog.csdn.net/KimBing/article/details/124249590](https://blog.csdn.net/KimBing/article/details/124249590)

```bash
pm2 start bin/www --name diary
```

Nếu bạn thực sự không sử dụng pm2, bạn cũng có thể khởi chạy trực tiếp bằng cách sử dụng phương pháp gốc `npm`

```bash
npm run start
```

Sau khi dự án khởi chạy, nó sẽ chạy trên `localhost:3000`，truy cập trực tiếp địa chỉ này, bạn nên có thể thấy：

<img width="539" alt="Screen Shot 2022-04-19 at 21 47 25" src="https://user-images.githubusercontent.com/12215982/164018379-bb497ec3-53e4-46c5-969a-c5b3ca4c0c31.png">


### 4. Khởi tạo cơ sở dữ liệu

> Chú ý：Khởi tạo sẽ xóa tất cả nội dung trong cơ sở dữ liệu `diary`


1. Xóa tệp `DATABASE_LOCK` trong thư mục phía sau.
2. Truy cập trực tiếp đường dẫn `Tên miền hoặc IP của máy chủ của bạn:3000/init` để khởi tạo cơ sở dữ liệu, khởi tạo cơ sở dữ liệu sẽ tự động tạo một cơ sở dữ liệu có tên là `diary`.
3. Sau khi khởi tạo, nó sẽ tự động tạo một tệp có tên là `DATABASE_LOCK` trong thư mục dự án, sau đó không thể thực hiện giao diện này nữa, nếu bạn muốn khởi tạo lại, bạn cần xóa tệp này trước.



### 5. Cấu hình nginx, ánh xạ đường dẫn `localhost:3000` đến đường dẫn `/portal`

1. Mở tệp cấu hình nginx，
- Tệp cấu hình nginx của CentOS nằm trong thư mục `/etc/nginx/conf.d/`.
- Tệp cấu hình nginx của Ubuntu nằm trong `/etc/nginx/site-avilable/default`.

2. Mở tệp `default.conf` hoặc `default`
    ```bash
    vi default.conf
    ```

3. Trong phần http, ngoài phần server, thêm nội dung sau

    ```bash
     upstream diary_server {
         server localhost:3000;
         keepalive 2000;
     }
    ```

4. Sau đó, thêm vào phần bên trong server：

    ```bash
    location /portal/ {
        proxy_pass http://diary_server/; # Tên upstream tương ứng ở trên
        proxy_set_header Host $host:$server_port; # Bạn có thể sao chép nguyên văn ở đây
    }
    ```
5. Như vậy, nó sẽ ánh xạ giao diện `localhost:3000` đến đường dẫn `localhost/portal/`
6. Khởi động lại dịch vụ nginx
    ```bash
    systemctl restart nginx
    ```
7. Thêm nhiệm vụ cron
   Trong dữ liệu người dùng, có thống kê về nhật ký và thông tin khác của người dùng, quá trình thống kê này mất một chút thời gian, vì vậy nó được đặt là một nhiệm vụ theo thời gian, thực hiện mỗi giờ một lần.
   Ví dụ với Ubuntu
   Thực hiện
   ```bash
   crontab -e
   ```
   Sau đó, thêm nội dung sau vào cửa sổ mở ra, ý nghĩa là thống kê và cập nhật dữ liệu người dùng vào phút thứ 17 của mỗi giờ, đường dẫn js dưới đây được thay đổi thành đường dẫn JS của hệ thống của bạn.
   ```bash
   17 * * * * node /var/www/html/portal/routes/cron/updateUserInfo.js
   ```
   Sau đó, khởi động lại dịch vụ cron
   ```bash
   systemctl restart cron
   ```

### 6. Đặt tài khoản quản trị viên
1. Sau khi đăng ký bằng mã mời chung đã đặt ở trên
2. Sửa đổi trực tiếp `users.group_id` của người dùng tương ứng trong cơ sở dữ liệu thành `1` (quản trị viên)
3. Đăng nhập lại người dùng trên trang web, bạn sẽ thấy menu **Mã mời**.

### 7. Cấu hình dự án phía trước
1. Tải xuống [https://github.com/KyleBing/diary-vue](https://github.com/KyleBing/diary-vue)
2. Cài đặt phụ thuộc, thực hiện `npm i` hoặc `yarn`
3. Nếu bạn cần sửa đổi đường dẫn yêu cầu phía sau của phía trước, sửa đổi `BASE_URL` trong `/src/request.js`

4. Thực hiện `npm build` sẽ tạo ra các tệp môi trường sản xuất của dự án phía trước, đối với dự án này, nó sẽ được tạo trong thư mục `./dist/`, cũng sẽ tạo ra một gói nén có tên là `diary-2023-06-xx.zip` trong thư mục `./archive`. Nội dung của gói nén này chính là nội dung của `../diary`, nhưng không bao gồm thư mục `diary` bên ngoài.
5. Đặt các tệp dự án vào thư mục chính của nginx trên máy chủ tại `/diary/`
6. Lúc này, dự án phía sau đang ở trong thư mục `/portal/`, dự án phía trước đang ở trong `/diary/`, như vậy bạn có thể sử dụng trực tiếp

## Ba, Hướng dẫn phát triển

### 1. Giải thích mật khẩu
Mật khẩu sử dụng [bcrypt](https://github.com/kelektiv/node.bcrypt.js) để mã hóa
### 2. Định dạng dữ liệu trả về

```json
{
  "success": true,
  "message": "Thông tin gợi ý",
  "data": {}
}
```

## Bốn, Khác
> Bắt đầu từ `2022-04-14`