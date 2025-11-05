# Hướng dẫn sử dụng Seed để tạo dữ liệu fake

## 📍 Dữ liệu seed được lưu ở đâu?

**Dữ liệu seed được lưu vào MongoDB database** thông qua Mongoose.

### Cấu hình MongoDB

Backend sử dụng biến môi trường `MONGO_URI` để kết nối MongoDB:

```typescript
// app.module.ts
MongooseModule.forRoot(process.env.MONGO_URI || '')
```

### Các collection trong MongoDB:

Sau khi seed, dữ liệu sẽ được lưu vào các collection sau:

- **`airports`** - Danh sách sân bay
- **`users`** - Danh sách người dùng
- **`flights`** - Danh sách chuyến bay
- **`bookings`** - Danh sách đặt chỗ
- **`comments`** - Danh sách đánh giá
- **`notifications`** - Danh sách thông báo
- **`paymenttransactions`** - Danh sách giao dịch thanh toán

### Cách kiểm tra dữ liệu trong MongoDB:

1. **Dùng MongoDB Compass** (GUI tool):
   - Tải tại: https://www.mongodb.com/products/tools/compass
   - Kết nối với `MONGO_URI` từ file `.env`
   - Xem các collection và documents

2. **Dùng MongoDB Shell (mongosh)**:
   ```bash
   mongosh "mongodb://localhost:27017/your-database-name"
   use your-database-name
   db.airports.find()
   db.flights.find()
   ```

3. **Dùng API endpoints**:
   - `GET /airports` - Xem danh sách sân bay
   - `GET /flights` - Xem danh sách chuyến bay
   - `GET /users` - Xem danh sách người dùng
   - `GET /bookings` - Xem danh sách đặt chỗ

### Lưu ý:

- **Dữ liệu seed sẽ XÓA TẤT CẢ DỮ LIỆU CŨ** trong các collection trước khi tạo mới
- Nếu bạn chưa có MongoDB, cần cài đặt MongoDB hoặc dùng MongoDB Atlas (cloud)
- Đảm bảo `MONGO_URI` trong file `.env` đúng và MongoDB đang chạy

## Cách sử dụng Seed

### Bước 1: Khởi động Backend Server
```bash
cd flight_backend
npm run start:dev
```

Backend sẽ chạy tại `http://localhost:3000` (hoặc port bạn đã cấu hình)

### Bước 2: Gọi API Seed để tạo dữ liệu

Có 2 cách:

#### Cách 1: Dùng Postman/Thunder Client/Insomnia
- Method: `POST`
- URL: `http://localhost:3000/seed`
- Body: Không cần (empty body)
- Response sẽ trả về:
```json
{
  "message": "Đã tạo dữ liệu fake thành công",
  "data": {
    "airports": 16,
    "users": 6,
    "flights": 1000+,
    "bookings": 25,
    "comments": 35,
    "notifications": 45,
    "paymentTransactions": 30+
  }
}
```

#### Cách 2: Dùng curl (terminal)
```bash
curl -X POST http://localhost:3000/seed
```

#### Cách 3: Dùng trình duyệt (chỉ GET)
- Mở trình duyệt và truy cập: `http://localhost:3000/seed/status`
- Để seed, bạn cần dùng Postman hoặc tool khác để gọi POST

### Bước 3: Kiểm tra dữ liệu đã được tạo

Sau khi seed, bạn có thể kiểm tra các endpoint:

- **Airports**: `GET http://localhost:3000/airports`
- **Flights**: `GET http://localhost:3000/flights/search?from=HAN&to=SGN`
- **Users**: `GET http://localhost:3000/users`
- **Bookings**: `GET http://localhost:3000/bookings`

### Bước 4: Frontend tự động lấy dữ liệu từ DB

Sau khi seed xong, Frontend sẽ tự động:
- Lấy danh sách airports từ `GET /airports` (thay vì `/airports/mock`)
- Tìm kiếm flights từ `GET /flights/search` (thay vì `/flights/mock-search`)

## Lưu ý quan trọng

⚠️ **Lưu ý**: 
- Seed sẽ **XÓA TẤT CẢ DỮ LIỆU CŨ** và tạo mới
- Mỗi lần gọi POST `/seed` sẽ tạo lại toàn bộ dữ liệu
- Nếu bạn muốn giữ lại dữ liệu cũ, comment dòng `deleteMany()` trong seed service

## Dữ liệu được tạo

- **16 sân bay** (8 Việt Nam + 8 quốc tế)
- **6 users** (5 customers + 1 admin, password: `password123`)
- **1000+ chuyến bay** cho 30 ngày tới
- **25 bookings** với các status khác nhau
- **35 comments** đánh giá chuyến bay
- **45 notifications** cho users
- **30+ payment transactions**

## Troubleshooting

### Lỗi: "Không có dữ liệu airports"
→ Bạn chưa gọi POST `/seed` để tạo dữ liệu

### Lỗi: "Cannot connect to backend"
→ Kiểm tra backend có đang chạy không
→ Kiểm tra `EXPO_PUBLIC_BACKEND_URL` trong `.env` của frontend

### Lỗi: "Endpoint not found"
→ Kiểm tra URL backend trong biến môi trường
→ Đảm bảo SeedModule đã được import vào AppModule

