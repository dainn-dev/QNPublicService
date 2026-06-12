# Hệ thống tìm kiếm địa điểm dịch vụ tại Quảng Ngãi

**Đồ án tốt nghiệp**

| | |
|---|---|
| **Tên đề tài** | Xây dựng hệ thống tìm kiếm địa điểm dịch vụ tại Quảng Ngãi |
| **SVTH** | Nguyễn Hoàng Anh |
| **Lớp** | D15HT02 |
| **GVHD** | Dương Thị Kim Chi |

---

## Mô tả hệ thống

Ứng dụng web hỗ trợ người dân tìm kiếm, tra cứu và sử dụng các dịch vụ công tại TP. Quảng Ngãi. Hệ thống gồm ba giao diện riêng biệt dành cho **công dân**, **cán bộ xử lý** và **quản trị viên**.

---

## Chức năng

### Công dân
- Tìm kiếm điểm tiếp nhận dịch vụ công theo địa chỉ, quận/phường, loại hình
- Xem thông tin chi tiết điểm dịch vụ (địa chỉ, giờ làm việc, liên hệ, bản đồ)
- Tra cứu danh mục dịch vụ công và thủ tục hành chính
- Nộp hồ sơ trực tuyến và theo dõi trạng thái xử lý
- Gửi phản ánh, kiến nghị và theo dõi tiến độ giải quyết
- Đánh giá chất lượng dịch vụ và điểm tiếp nhận
- Nhận thông báo cập nhật trạng thái hồ sơ

### Cán bộ xử lý
- Tiếp nhận và xử lý hồ sơ dịch vụ công
- Cập nhật trạng thái hồ sơ theo quy trình (tiếp nhận → xử lý → yêu cầu bổ sung → hoàn thành)
- Tiếp nhận và xử lý phản ánh, kiến nghị từ người dân
- Ghi chú nội bộ trên hồ sơ và phản ánh

### Quản trị viên
- Quản lý danh mục dịch vụ công (thêm, sửa, xóa, phân cấp danh mục)
- Quản lý điểm tiếp nhận (thông tin, hình ảnh, dịch vụ cung cấp)
- Quản lý tài khoản người dùng và phân quyền (công dân / cán bộ / admin)
- Xem nhật ký hệ thống (audit log) theo dõi mọi thao tác thay đổi dữ liệu
- Seed dữ liệu đơn vị hành chính (tỉnh/phường) từ API quốc gia

---

## Công nghệ

| Thành phần | Công nghệ |
|---|---|
| **Backend** | .NET 8 / ASP.NET Core, Clean Architecture |
| **Cơ sở dữ liệu** | PostgreSQL 16, EF Core 8 |
| **Xác thực** | JWT Bearer, thư viện DainnUser v1.0.2 |
| **Frontend** | React 18 (Babel Standalone), Tailwind CSS |
| **Dev server** | http-server |
| **Hạ tầng** | Docker, Docker Compose |

---

## Cấu trúc dự án

```
DVC/
├── frontend/           # Giao diện người dùng (React, Tailwind)
│   ├── Home.html       # Cổng công dân
│   ├── Manage.html     # Giao diện cán bộ
│   └── Administator.html  # Trang quản trị
├── backend/            # REST API (.NET 8)
│   ├── src/
│   │   ├── DVC.Domain
│   │   ├── DVC.Application
│   │   ├── DVC.Infrastructure
│   │   └── DVC.Api
│   └── docker-compose.yml
└── package.json        # Dev script chạy frontend
```

---

## Chạy dự án

### Yêu cầu
- .NET 8 SDK
- Node.js + pnpm (hoặc npm)
- Docker

### 1. Khởi động hạ tầng (PostgreSQL + Mailpit)

```bash
cd backend
docker compose up -d
```

### 2. Chạy Backend API

```bash
cd backend/src/DVC.Api
ASPNETCORE_ENVIRONMENT=Development dotnet run
```

API tại `http://localhost:5134` · Swagger: `http://localhost:5134/swagger`

### 3. Chạy Frontend

```bash
# Từ thư mục gốc
pnpm dev
```

| Giao diện | URL |
|---|---|
| Công dân | http://localhost:8765/Home.html |
| Cán bộ | http://localhost:8765/Manage.html |
| Quản trị | http://localhost:8765/Administator.html |

---

Xem thêm hướng dẫn chi tiết tại [backend/README.md](backend/README.md) và [frontend/README.md](frontend/README.md).
