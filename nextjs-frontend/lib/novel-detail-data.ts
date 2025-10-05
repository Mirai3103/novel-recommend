export interface Novel {
  id: string
  title: string
  other_titles: string[]
  authors: string[]
  artists: string[]
  tags: string[]
  type: string
  status: string
  description: string
  image_url: string
  meta: {
    year?: number
    publisher?: string
    total_views?: number
    total_favorites?: number
    last_updated?: string
  }
}

export interface Chapter {
  id: string
  volume_id: string
  title: string
  order: number
  meta: {
    word_count?: number
    published_date?: string
    views?: number
  }
}

export interface Volume {
  id: string
  novel_id: string
  title: string
  order: number
  image_url: string
  chapters: Chapter[]
}

export interface Rating {
  user_id: string
  username: string
  avatar: string
  rating: number
  created_at: string
}

export interface Comment {
  id: string
  user_id: string
  username: string
  avatar: string
  content: string
  likes: number
  replies: Comment[]
  created_at: string
}

// Mock novel data
export const mockNovel: Novel = {
  id: "slime-reincarnation",
  title: "Tôi Chuyển Sinh Thành Slime Mạnh Nhất",
  other_titles: ["That Time I Got Reincarnated as the Strongest Slime", "転生したら最強スライムだった件"],
  authors: ["Fuse", "Kawakami Taiki"],
  artists: ["Mitz Vah"],
  tags: ["Isekai", "Fantasy", "Adventure", "Comedy", "Magic", "Reincarnation", "Overpowered MC"],
  type: "Light Novel",
  status: "Đang tiến hành",
  description: `Satoru Mikami, một nhân viên văn phòng 37 tuổi bình thường, bị đâm chết trong một vụ cướp ngẫu nhiên. Tuy nhiên, khi tỉnh dậy, anh phát hiện mình đã chuyển sinh thành một con slime trong một thế giới fantasy khác!

Với khả năng đặc biệt "Predator" cho phép hấp thụ và sao chép kỹ năng của bất kỳ sinh vật nào, cùng với "Great Sage" - một trí tuệ nhân tạo siêu việt, Satoru bắt đầu hành trình khám phá thế giới mới của mình.

Từ một con slime yếu ớt, anh dần trở thành một trong những sinh vật mạnh nhất thế giới, xây dựng một quốc gia của riêng mình và kết bạn với vô số chủng tộc khác nhau. Đây là câu chuyện về hành trình phi thường của một con slime từ zero trở thành hero!`,
  image_url: "https://placewaifu.com/image/300/450",
  meta: {
    year: 2014,
    publisher: "Micro Magazine",
    total_views: 15420000,
    total_favorites: 89500,
    last_updated: "2024-03-15T10:30:00Z",
  },
}

// Generate volumes with chapters
export const mockVolumes: Volume[] = [
  {
    id: "vol-1",
    novel_id: "slime-reincarnation",
    title: "Volume 1: Slime Đầu Tiên",
    order: 1,
    image_url: "https://placewaifu.com/image/150/200",
    chapters: Array.from({ length: 20 }, (_, i) => ({
      id: `ch-1-${i + 1}`,
      volume_id: "vol-1",
      title: i === 0 ? "Prologue: Cái Chết Bất Ngờ" : `Chapter ${i}: ${getChapterTitle(1, i)}`,
      order: i + 1,
      meta: {
        word_count: Math.floor(Math.random() * 3000) + 2000,
        published_date: new Date(2024, 0, i + 1).toISOString(),
        views: Math.floor(Math.random() * 50000) + 10000,
      },
    })),
  },
  {
    id: "vol-2",
    novel_id: "slime-reincarnation",
    title: "Volume 2: Xây Dựng Quốc Gia",
    order: 2,
    image_url: "https://placewaifu.com/image/150/200",
    chapters: Array.from({ length: 18 }, (_, i) => ({
      id: `ch-2-${i + 1}`,
      volume_id: "vol-2",
      title: `Chapter ${i + 1}: ${getChapterTitle(2, i)}`,
      order: i + 1,
      meta: {
        word_count: Math.floor(Math.random() * 3000) + 2000,
        published_date: new Date(2024, 1, i + 1).toISOString(),
        views: Math.floor(Math.random() * 45000) + 8000,
      },
    })),
  },
  {
    id: "vol-3",
    novel_id: "slime-reincarnation",
    title: "Volume 3: Liên Minh Các Chủng Tộc",
    order: 3,
    image_url: "https://placewaifu.com/image/150/200",
    chapters: Array.from({ length: 22 }, (_, i) => ({
      id: `ch-3-${i + 1}`,
      volume_id: "vol-3",
      title: `Chapter ${i + 1}: ${getChapterTitle(3, i)}`,
      order: i + 1,
      meta: {
        word_count: Math.floor(Math.random() * 3000) + 2000,
        published_date: new Date(2024, 2, i + 1).toISOString(),
        views: Math.floor(Math.random() * 40000) + 7000,
      },
    })),
  },
  {
    id: "vol-4",
    novel_id: "slime-reincarnation",
    title: "Volume 4: Cuộc Chiến Ma Vương",
    order: 4,
    image_url: "https://placewaifu.com/image/150/200",
    chapters: Array.from({ length: 20 }, (_, i) => ({
      id: `ch-4-${i + 1}`,
      volume_id: "vol-4",
      title: `Chapter ${i + 1}: ${getChapterTitle(4, i)}`,
      order: i + 1,
      meta: {
        word_count: Math.floor(Math.random() * 3000) + 2000,
        published_date: new Date(2024, 3, i + 1).toISOString(),
        views: Math.floor(Math.random() * 35000) + 6000,
      },
    })),
  },
]

function getChapterTitle(volume: number, index: number): string {
  const titles = [
    // Volume 1
    [
      "Thế Giới Mới",
      "Kỹ Năng Đầu Tiên",
      "Gặp Gỡ Veldora",
      "Thoát Khỏi Hang Động",
      "Làng Goblin",
      "Cuộc Tấn Công",
      "Sức Mạnh Thức Tỉnh",
      "Xây Dựng Làng",
      "Người Lùn Đến Thăm",
      "Liên Minh Mới",
      "Ogre Xuất Hiện",
      "Trận Chiến Đầu Tiên",
      "Tiến Hóa",
      "Tên Mới",
      "Thành Phố Phép Thuật",
      "Gặp Shizu",
      "Quá Khứ Bi Thương",
      "Lời Hứa",
      "Epilogue: Khởi Đầu Mới",
    ],
    // Volume 2
    [
      "Nhiệm Vụ Mới",
      "Học Viện Phép Thuật",
      "Học Sinh Đặc Biệt",
      "Bài Học Đầu Tiên",
      "Sức Mạnh Tiềm Ẩn",
      "Giải Đấu",
      "Chiến Thắng",
      "Trở Về Làng",
      "Kế Hoạch Mở Rộng",
      "Thương Nhân Đến",
      "Xây Dựng Đường Xá",
      "Liên Minh Dwarf",
      "Vũ Khí Mới",
      "Mối Đe Dọa",
      "Chuẩn Bị Chiến Tranh",
      "Trận Chiến Lớn",
      "Thắng Lợi",
      "Epilogue: Quốc Gia Mới",
    ],
    // Volume 3
    [
      "Hội Nghị Các Chủng Tộc",
      "Đề Xuất Liên Minh",
      "Ký Kết Hiệp Ước",
      "Ma Vương Xuất Hiện",
      "Thách Thức",
      "Sức Mạnh Thật Sự",
      "Chiến Đấu Ma Vương",
      "Thắng Lợi Khó Khăn",
      "Hậu Quả",
      "Xây Dựng Lại",
      "Khách Bí Ẩn",
      "Âm Mưu Bóng Tối",
      "Điều Tra",
      "Phát Hiện Sự Thật",
      "Đối Đầu",
      "Trận Chiến Quyết Định",
      "Hòa Bình Trở Lại",
      "Lễ Hội",
      "Tương Lai Tươi Sáng",
      "Mối Đe Dọa Mới",
      "Epilogue: Tiếp Tục Hành Trình",
    ],
    // Volume 4
    [
      "Triệu Hồi Khẩn Cấp",
      "Chiến Tranh Sắp Đến",
      "Chuẩn Bị Quân Đội",
      "Huấn Luyện",
      "Chiến Lược",
      "Xuất Quân",
      "Trận Đầu",
      "Địch Mạnh",
      "Kỹ Năng Mới",
      "Phản Công",
      "Liên Minh Hỗ Trợ",
      "Chiến Trường Hỗn Loạn",
      "Quyết Chiến",
      "Sức Mạnh Tối Thượng",
      "Ma Vương Thức Tỉnh",
      "Đối Đầu Cuối Cùng",
      "Chiến Thắng",
      "Hậu Chiến",
      "Epilogue: Hòa Bình Mới",
    ],
  ]

  return titles[volume - 1]?.[index] || `Chương ${index + 1}`
}

// Mock ratings
export const mockRatings: Rating[] = Array.from({ length: 25 }, (_, i) => ({
  user_id: `user-${i + 1}`,
  username: `Reader${i + 1}`,
  avatar: `https://placewaifu.com/image/40/40?id=${i}`,
  rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
  created_at: new Date(2024, 2, Math.floor(Math.random() * 30) + 1).toISOString(),
}))

// Mock comments
export const mockComments: Comment[] = [
  {
    id: "comment-1",
    user_id: "user-1",
    username: "Animelover2024",
    avatar: "https://placewaifu.com/image/40/40?id=1",
    content:
      "Đây là một trong những light novel hay nhất mà tôi từng đọc! Cốt truyện hấp dẫn, nhân vật được xây dựng rất tốt, và hệ thống ma thuật cũng rất logic. Đặc biệt là phần tiến hóa của Rimuru thật sự epic!",
    likes: 156,
    created_at: "2024-03-10T14:30:00Z",
    replies: [
      {
        id: "reply-1-1",
        user_id: "user-2",
        username: "MangaFan99",
        avatar: "https://placewaifu.com/image/40/40?id=2",
        content:
          "Đồng ý! Tôi cũng rất thích cách tác giả xây dựng thế giới. Mỗi chủng tộc đều có đặc điểm riêng và không bị lặp lại.",
        likes: 45,
        created_at: "2024-03-10T15:00:00Z",
        replies: [],
      },
      {
        id: "reply-1-2",
        user_id: "user-3",
        username: "LightNovelReader",
        avatar: "https://placewaifu.com/image/40/40?id=3",
        content: "Phần chiến đấu với Ma Vương ở volume 4 quá đỉnh luôn!",
        likes: 32,
        created_at: "2024-03-10T16:20:00Z",
        replies: [],
      },
    ],
  },
  {
    id: "comment-2",
    user_id: "user-4",
    username: "IsekaiMaster",
    avatar: "https://placewaifu.com/image/40/40?id=4",
    content:
      "Mình đã đọc cả manga và anime, nhưng light novel vẫn hay nhất. Có nhiều chi tiết và phát triển nhân vật sâu sắc hơn rất nhiều. Highly recommended!",
    likes: 98,
    created_at: "2024-03-11T10:15:00Z",
    replies: [
      {
        id: "reply-2-1",
        user_id: "user-5",
        username: "NovelAddict",
        avatar: "https://placewaifu.com/image/40/40?id=5",
        content:
          "Đúng vậy! Light novel luôn có nhiều thông tin hơn. Đặc biệt là phần suy nghĩ nội tâm của Rimuru rất thú vị.",
        likes: 28,
        created_at: "2024-03-11T11:30:00Z",
        replies: [],
      },
    ],
  },
  {
    id: "comment-3",
    user_id: "user-6",
    username: "FantasyGeek",
    avatar: "https://placewaifu.com/image/40/40?id=6",
    content: "Volume 3 hơi chậm một chút nhưng volume 4 bù lại quá đã! Không thể chờ đợi volume 5 được nữa 😭",
    likes: 67,
    created_at: "2024-03-12T09:45:00Z",
    replies: [],
  },
  {
    id: "comment-4",
    user_id: "user-7",
    username: "SlimeSupporter",
    avatar: "https://placewaifu.com/image/40/40?id=7",
    content:
      "Hệ thống kỹ năng trong truyện này được thiết kế rất hay. Không quá OP ngay từ đầu nhưng cũng không quá yếu. Balance rất tốt!",
    likes: 89,
    created_at: "2024-03-13T13:20:00Z",
    replies: [
      {
        id: "reply-4-1",
        user_id: "user-8",
        username: "PowerScaler",
        avatar: "https://placewaifu.com/image/40/40?id=8",
        content: "Đồng ý! Great Sage và Predator là combo quá mạnh nhưng vẫn hợp lý trong bối cảnh truyện.",
        likes: 34,
        created_at: "2024-03-13T14:00:00Z",
        replies: [],
      },
    ],
  },
  {
    id: "comment-5",
    user_id: "user-9",
    username: "WebNovelVet",
    avatar: "https://placewaifu.com/image/40/40?id=9",
    content:
      "Đã đọc web novel version rồi nhưng vẫn đọc lại light novel vì bản dịch tốt hơn và có thêm nhiều chi tiết mới. Worth it!",
    likes: 54,
    created_at: "2024-03-14T08:30:00Z",
    replies: [],
  },
  {
    id: "comment-6",
    user_id: "user-10",
    username: "CharacterAnalyst",
    avatar: "https://placewaifu.com/image/40/40?id=10",
    content:
      "Các nhân vật phụ cũng được phát triển rất tốt, không chỉ là background characters. Shion, Benimaru, Shuna đều có personality riêng và đóng góp vào cốt truyện.",
    likes: 112,
    created_at: "2024-03-14T16:45:00Z",
    replies: [
      {
        id: "reply-6-1",
        user_id: "user-11",
        username: "ShionFan",
        avatar: "https://placewaifu.com/image/40/40?id=11",
        content: "Shion best girl! 💜",
        likes: 23,
        created_at: "2024-03-14T17:00:00Z",
        replies: [],
      },
      {
        id: "reply-6-2",
        user_id: "user-12",
        username: "ShunaSupporter",
        avatar: "https://placewaifu.com/image/40/40?id=12",
        content: "Shuna mới là best girl nha! 😊",
        likes: 19,
        created_at: "2024-03-14T17:15:00Z",
        replies: [],
      },
    ],
  },
]

// Recommended novels
export const recommendedNovels = [
  {
    id: "overlord",
    title: "Overlord: Ma Vương Bất Tử",
    image: "https://placewaifu.com/image/200/300?id=rec1",
    rating: 4.7,
    chapters: 156,
    tags: ["Isekai", "Fantasy", "Dark"],
  },
  {
    id: "konosuba",
    title: "Konosuba: Phép Thuật Cho Thế Giới Tươi Đẹp",
    image: "https://placewaifu.com/image/200/300?id=rec2",
    rating: 4.6,
    chapters: 142,
    tags: ["Isekai", "Comedy", "Adventure"],
  },
  {
    id: "rezero",
    title: "Re:Zero - Bắt Đầu Lại Ở Thế Giới Khác",
    image: "https://placewaifu.com/image/200/300?id=rec3",
    rating: 4.8,
    chapters: 178,
    tags: ["Isekai", "Fantasy", "Drama"],
  },
  {
    id: "mushoku",
    title: "Mushoku Tensei: Thất Nghiệp Chuyển Sinh",
    image: "https://placewaifu.com/image/200/300?id=rec4",
    rating: 4.7,
    chapters: 189,
    tags: ["Isekai", "Fantasy", "Adventure"],
  },
  {
    id: "shield-hero",
    title: "Tate no Yuusha: Dũng Sĩ Khiên",
    image: "https://placewaifu.com/image/200/300?id=rec5",
    rating: 4.5,
    chapters: 134,
    tags: ["Isekai", "Fantasy", "Action"],
  },
  {
    id: "goblin-slayer",
    title: "Goblin Slayer: Kẻ Diệt Goblin",
    image: "https://placewaifu.com/image/200/300?id=rec6",
    rating: 4.4,
    chapters: 98,
    tags: ["Fantasy", "Dark", "Action"],
  },
  {
    id: "danmachi",
    title: "DanMachi: Dungeon Ni Deai",
    image: "https://placewaifu.com/image/200/300?id=rec7",
    rating: 4.6,
    chapters: 167,
    tags: ["Fantasy", "Adventure", "Romance"],
  },
  {
    id: "log-horizon",
    title: "Log Horizon: Chân Trời Ký Lục",
    image: "https://placewaifu.com/image/200/300?id=rec8",
    rating: 4.5,
    chapters: 145,
    tags: ["Isekai", "Fantasy", "Strategy"],
  },
]
