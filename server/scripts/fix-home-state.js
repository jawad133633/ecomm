const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, '../../client/src/screens/Home.jsx');
let src = fs.readFileSync(homePath, 'utf8');

const target = "export default function Home() {\n  const [products, setProducts] = useState(demoProducts);\n  const [category, setCategory]";
const targetCRLF = "export default function Home() {\r\n  const [products, setProducts] = useState(demoProducts);\r\n  const [category, setCategory]";

const addition = "export default function Home() {\n  const [products, setProducts] = useState(demoProducts);\n  const [visibleCount, setVisibleCount] = useState(12);\n  const [totalCount, setTotalCount] = useState(5000);\n  const [homePage, setHomePage] = useState(1);\n  const [loadingMore, setLoadingMore] = useState(false);\n  const [category, setCategory]";
const additionCRLF = "export default function Home() {\r\n  const [products, setProducts] = useState(demoProducts);\r\n  const [visibleCount, setVisibleCount] = useState(12);\r\n  const [totalCount, setTotalCount] = useState(5000);\r\n  const [homePage, setHomePage] = useState(1);\r\n  const [loadingMore, setLoadingMore] = useState(false);\r\n  const [category, setCategory]";

if (src.includes(target)) {
  src = src.replace(target, addition);
  console.log('Replaced LF version');
} else if (src.includes(targetCRLF)) {
  src = src.replace(targetCRLF, additionCRLF);
  console.log('Replaced CRLF version');
} else {
  console.error('Could not find target in Home.jsx');
  process.exit(1);
}

fs.writeFileSync(homePath, src);
console.log('✅ Successfully added missing state variables to Home.jsx');

