import axios from 'axios';

const MainPage = () => {
  return (
    <div className="flex h-full w-full flex-wrap justify-center">
      <div className=" flex h-12 w-full select-none items-center justify-center bg-slate-100 shadow-md">
        <img src="logo.png" alt="" srcset="" className="relative mt-6 h-20 w-24" />
        <h1 className="font-roboto text-2xl font-extrabold italic tracking-tighter text-slate-600">Advanced Content Searcher</h1>
      </div>
      <div className="mt-56 flex h-[50vh] w-full justify-center">
        <div className="ml-1 mr-1 flex h-full w-96 flex-wrap content-start justify-center rounded-sm bg-slate-600">
          <h1 className="mt-3 font-roboto text-3xl font-normal tracking-tighter text-slate-200">Keyword Generator</h1>

          <div className="mt-6 flex flex-col">
            <h1 className="font-nunito text-sm tracking-wider text-slate-200">Input:</h1>
            <input type="text" name="" id="keyword-input" className="relative w-72" />
          </div>
          <div className="flex w-72 justify-end">
            <button onClick={HandleKeywords} className="mt-2 h-7 w-20 rounded-sm bg-slate-500 font-nunito tracking-wider text-slate-200 hover:scale-[1.01]">
              Generate
            </button>
          </div>
          <div className="mt-5 h-3/5 w-72 overflow-y-scroll bg-slate-50" id="keywords-content"></div>
        </div>

        <div className="ml-1 mr-1 flex h-full w-96 flex-wrap content-start justify-center rounded-sm bg-slate-600">
          <h1 className="mt-3 font-roboto text-3xl font-normal tracking-tighter text-slate-200">Links Generator</h1>

          <div className="mt-6 flex flex-col">
            <h1 className="font-nunito text-sm tracking-wider text-slate-200">Keywords:</h1>
            <input type="text" name="" id="link-keywords-input" className="relative w-72" />
          </div>
          <div className="flex w-72 justify-between">
            <div className="mt-1 flex flex-col">
              <h1 className="font-nunito text-xs tracking-wider text-slate-200">Time Limit(s):</h1>
              <input type="number" name="" id="link-limit" placeholder="30" className="relative w-24" />
            </div>
            <button onClick={HandleLinks} className="mt-4 h-7 w-20 rounded-sm bg-slate-500 font-nunito tracking-wider text-slate-200 hover:scale-[1.01]">
              Generate
            </button>
          </div>
          <div className="mt-5 h-[59%] w-72 overflow-y-scroll bg-slate-50" id="links-content"></div>
        </div>

        <div className="ml-1 mr-1 flex h-full w-96 flex-wrap content-start justify-center rounded-sm bg-slate-600">
          <h1 className="mt-3 font-roboto text-3xl font-normal tracking-tighter text-slate-200">Content Searcher</h1>

          <div className="mt-6 flex flex-col">
            <h1 className="font-nunito text-sm tracking-wider text-slate-200">Links:</h1>
            <input type="text" name="" id="content-links" className="relative h-20 w-72" />
            <h1 className="font-nunito text-sm tracking-wider text-slate-200">Exceptions:</h1>
            <input type="text" name="" id="exception-input" className="relative h-10 w-72" />
            <div className="mt-1 flex flex-col">
              <h1 className="font-nunito text-xs tracking-wider text-slate-200">Matching Regex:</h1>
              <input type="text" name="" id="content-regex" placeholder="" className="relative w-72" />
            </div>
          </div>
          <div className="flex w-72 justify-between">
            <div className="mt-1 flex flex-col">
              <h1 className="font-nunito text-xs tracking-wider text-slate-200">Time Limit(s):</h1>
              <input type="number" name="" id="content-limit" placeholder="30" className="relative w-24" />
            </div>
            <button onClick={HandleSearcher} className="mt-4 h-7 w-20 rounded-sm bg-slate-500 font-nunito tracking-wider text-slate-200 hover:scale-[1.01]">
              Generate
            </button>
          </div>
          <div className="mt-5 h-[25%] w-72 overflow-y-scroll bg-slate-50" id="search-content"></div>
        </div>
      </div>
    </div>
  );
};

const HandleKeywords = () => {
  const inputEl = document.getElementById('keyword-input');

  if (inputEl.value !== '') {
    axios
      .post('http://localhost:5500/keywords', {
        input: inputEl.value,
        amount: 100,
      })
      .then((res) => {
        document.getElementById('keywords-content').innerHTML = res.data.keywords;
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

const HandleLinks = () => {
  const keywordsEl = document.getElementById('link-keywords-input');
  const limitEl = document.getElementById('link-limit');

  const keywords = keywordsEl.value.split(',');
  var limit = 30;

  if (limitEl.value !== '') {
    limit = limitEl.value;
  }

  var data = {
    'browsers': 3,
    'keywords': keywords,
    'exceptions': [],
    'maxtime': limit,
  };

  axios
    .post('http://localhost:5900/linkscrawler', data)
    .then((res) => {
      document.getElementById('links-content').innerHTML = res.data.links;
    })
    .catch((err) => {
      console.log(err);
    });
};

const HandleSearcher = () => {
  const linksEl = document.getElementById('content-links');
  const exceptionEl = document.getElementById('exception-input');
  const regexEl = document.getElementById('content-regex');
  const limitEl = document.getElementById('content-limit');

  const links = linksEl.value.split(',');
  const filter = exceptionEl.value.split(',');

  var limit = 30;

  if (limitEl.value !== '') {
    limit = limit = new Number(limitEl.value);
  }

  console.log(limit);

  var data = {
    'links': links,
    'filter': filter,
    'pattern': regexEl.value,
    'timeout': limit,
  };

  console.log(data);

  axios
    .post('http://localhost:5500/linkscraper', data)
    .then((res) => {
      console.log(res.data);
      document.getElementById('search-content').innerHTML = res.data.matches;
    })
    .catch((err) => {
      console.log(err);
    });
};

export default MainPage;
