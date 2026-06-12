# DVC Frontend — Cổng Dịch vụ công TP. Quảng Ngãi

Giao diện người dùng cho cổng dịch vụ công — không dùng build step, chạy trực tiếp bằng static file server.

## Công nghệ

- **React 18** (Babel Standalone, CDN) — JSX được transform in-browser, không cần bundler
- **Tailwind CSS** (CDN)
- **http-server** — dev server cho file tĩnh

## Cấu trúc

```
frontend/
├── Home.html           # Cổng công dân
├── Manage.html         # Giao diện cán bộ / nhân viên
├── Administator.html   # Trang quản trị (admin)
├── js/
│   ├── data.js         # Mock data — công dân
│   ├── officer-data.js # Mock data — cán bộ
│   ├── admin-data.js   # Mock data — admin
│   └── i18n.js         # Chuỗi ngôn ngữ tiếng Việt
├── jsx/
│   ├── app.jsx             # Root app (công dân)
│   ├── auth.jsx            # Đăng nhập / đăng ký
│   ├── home.jsx            # Trang chủ công dân
│   ├── services.jsx        # Danh mục dịch vụ công
│   ├── service-points.jsx  # Điểm tiếp nhận hồ sơ
│   ├── feedback.jsx        # Phản ánh, kiến nghị
│   ├── requests.jsx        # Nộp hồ sơ trực tuyến
│   ├── profile.jsx         # Hồ sơ tài khoản
│   ├── components.jsx      # UI components dùng chung
│   ├── tweaks-panel.jsx    # Panel tuỳ chỉnh giao diện (dev)
│   ├── admin/
│   │   ├── app.jsx         # Root app (admin)
│   │   ├── shell.jsx       # Layout / navigation
│   │   ├── users.jsx       # Quản lý tài khoản
│   │   ├── catalogs.jsx    # Danh mục dịch vụ
│   │   ├── service-points.jsx  # Quản lý điểm tiếp nhận
│   │   └── notify-audit.jsx    # Thông báo & audit log
│   ├── officer/
│   │   ├── app.jsx         # Root app (cán bộ)
│   │   ├── shell.jsx       # Layout / navigation
│   │   ├── dashboard.jsx   # Tổng quan công việc
│   │   ├── feedback.jsx    # Xử lý phản ánh, kiến nghị
│   │   └── requests.jsx    # Xử lý hồ sơ
│   └── mobile/             # Prototype giao diện mobile
└── styles/
    ├── tokens.css          # CSS custom properties (màu, spacing)
    └── responsive.css      # Responsive utilities
```

## Chạy local

```bash
# Từ thư mục gốc của dự án (có package.json)
pnpm dev
# hoặc
npm run dev
```

Mở trình duyệt tại:

| URL | Giao diện |
|-----|-----------|
| http://localhost:8765/Home.html | Công dân |
| http://localhost:8765/Manage.html | Cán bộ xử lý |
| http://localhost:8765/Administator.html | Quản trị hệ thống |

> `pnpm dev` tự mở `Home.html`. Điều hướng thủ công sang `Manage.html` / `Administator.html` trên cùng port.

## Backend API

Hiện tại frontend dùng **mock data** (`js/data.js`, `js/officer-data.js`, `js/admin-data.js`).  
Backend REST API chạy tại `http://localhost:5134` — xem `backend/README.md` để khởi động.

Để kết nối frontend với backend, thay thế các lời gọi mock data trong từng `jsx/` file bằng `fetch()` tới `http://localhost:5134/api/...`.

## Cài dependencies

```bash
pnpm install
# hoặc npm install
```

Chỉ cần cho `http-server`. React và Tailwind được load qua CDN trong từng file HTML.
