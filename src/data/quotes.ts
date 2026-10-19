export interface Quote {
  id: number;
  text: string;
  author: string;
  source?: string;
  length: 'short' | 'medium' | 'long';
  lang: 'en' | 'vi';
}

export const QUOTES: Quote[] = [
  // --- English Short Quotes ---
  {
    id: 1,
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
    length: "short",
    lang: "en",
  },
  {
    id: 2,
    text: "Make each day your masterpiece.",
    author: "John Wooden",
    length: "short",
    lang: "en",
  },
  {
    id: 3,
    text: "Act as if what you do makes a difference. It does.",
    author: "William James",
    length: "short",
    lang: "en",
  },
  {
    id: 4,
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    length: "short",
    lang: "en",
  },
  {
    id: 5,
    text: "Stay hungry. Stay foolish.",
    author: "Steve Jobs",
    length: "short",
    lang: "en",
  },
  {
    id: 6,
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    length: "short",
    lang: "en",
  },

  // --- English Medium Quotes ---
  {
    id: 101,
    text: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson",
    length: "medium",
    lang: "en",
  },
  {
    id: 102,
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    length: "medium",
    lang: "en",
  },
  {
    id: 103,
    text: "What you do makes a difference, and you have to decide what kind of difference you want to make.",
    author: "Jane Goodall",
    length: "medium",
    lang: "en",
  },
  {
    id: 104,
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    length: "medium",
    lang: "en",
  },
  {
    id: 105,
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    length: "medium",
    lang: "en",
  },

  // --- English Long Quotes ---
  {
    id: 201,
    text: "The only person you are destined to become is the person you decide to be. What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
    length: "long",
    lang: "en",
  },
  {
    id: 202,
    text: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. So throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails.",
    author: "H. Jackson Brown Jr.",
    length: "long",
    lang: "en",
  },
  {
    id: 203,
    text: "Life is not easy for any of us. But what of that? We must have perseverance and above all confidence in ourselves. We must believe that we are gifted for something and that this thing must be attained.",
    author: "Marie Curie",
    length: "long",
    lang: "en",
  },

  // --- Vietnamese Short Quotes ---
  {
    id: 301,
    text: "Học, học nữa, học mãi.",
    author: "V.I. Lenin",
    length: "short",
    lang: "vi",
  },
  {
    id: 302,
    text: "Đường đi khó, không khó vì ngăn sông cách núi, mà khó vì lòng người ngại núi e sông.",
    author: "Nguyễn Bá Học",
    length: "short",
    lang: "vi",
  },
  {
    id: 303,
    text: "Không có gì quý hơn độc lập, tự do.",
    author: "Hồ Chí Minh",
    length: "short",
    lang: "vi",
  },
  {
    id: 304,
    text: "Tri thức là sức mạnh.",
    author: "Francis Bacon",
    length: "short",
    lang: "vi",
  },
  {
    id: 305,
    text: "Hành trình vạn dặm khởi đầu từ một bước chân.",
    author: "Lão Tử",
    length: "short",
    lang: "vi",
  },

  // --- Vietnamese Medium Quotes ---
  {
    id: 401,
    text: "Có tài mà không có đức là người vô dụng, có đức mà không có tài thì làm việc gì cũng khó.",
    author: "Hồ Chí Minh",
    length: "medium",
    lang: "vi",
  },
  {
    id: 402,
    text: "Thành công không phải là chìa khóa mở cánh cửa hạnh phúc. Hạnh phúc mới là chìa khóa dẫn tới thành công.",
    author: "Albert Schweitzer",
    length: "medium",
    lang: "vi",
  },
  {
    id: 403,
    text: "Người không học như ngọc không mài, ngọc không mài chẳng thành đồ quý, người không học chẳng biết đạo lý.",
    author: "Ngạn ngữ Á Đông",
    length: "medium",
    lang: "vi",
  },
  {
    id: 404,
    text: "Hãy sống như ngày mai bạn sẽ chết. Hãy học như thể bạn sẽ sống mãi mãi.",
    author: "Mahatma Gandhi",
    length: "medium",
    lang: "vi",
  },

  // --- Vietnamese Long Quotes ---
  {
    id: 501,
    text: "Non sông Việt Nam có trở nên tươi đẹp hay không, dân tộc Việt Nam có bước tới đài vinh quang để sánh vai với các cường quốc năm châu được hay không, chính là nhờ một phần lớn ở công học tập của các em.",
    author: "Hồ Chí Minh",
    source: "Thư gửi học sinh nhân ngày khai trường",
    length: "long",
    lang: "vi",
  },
  {
    id: 502,
    text: "Tương lai thuộc về những ai tin tưởng vào vẻ đẹp trong ước mơ của chính mình. Đừng để tiếng ồn của ý kiến người khác nhấn chìm tiếng nói sâu thẳm bên trong bạn.",
    author: "Danh ngôn cuộc sống",
    length: "long",
    lang: "vi",
  },
];

export function getQuotesByLang(lang: 'en' | 'vi', lengthFilter?: 'all' | 'short' | 'medium' | 'long'): Quote[] {
  let list = QUOTES.filter(q => q.lang === lang);
  if (lengthFilter && lengthFilter !== 'all') {
    list = list.filter(q => q.length === lengthFilter);
  }
  return list;
}

export function getRandomQuote(lang: 'en' | 'vi' = 'en', lengthFilter: 'all' | 'short' | 'medium' | 'long' = 'all'): Quote {
  const pool = getQuotesByLang(lang, lengthFilter);
  if (pool.length === 0) return QUOTES[0];
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
