# Table Dynamic JavaScript
Table Dynamic with Javascript and HTML

# Preview
## Table
![](https://github.com/silogos/table-dynamic/raw/main/Screen%20Shot%202022-07-07%20at%2022.44.35.png)
## Table Loading
![](https://github.com/silogos/table-dynamic/raw/main/Screen%20Shot%202022-07-07%20at%2022.48.11.png)
# Usage

## HTML
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="https://raw.githubusercontent.com/silogos/table-dynamic/main/table-dynamic.css">
</head>
<body>
  <table id="table-data"></table>
  <script src="https://raw.githubusercontent.com/silogos/table-dynamic/main/table-dynamic.js"></script>
  <script src="./script.js"></script>
</body>
</html>
```

## JavaScript
```js
// script.js
const initialData = {
  data: [
    { 
      id: 1, 
      email: 'si.logoz@gmail.com', 
      createdAt: '07/01/2022', 
      filename: 'data-dummy.xlsx', 
      filepath: 'http://example.com/data-dummy.xlsx',
      totalOrder: 10,
      approveBy: 'Amin Yusuf',
      status: 'pending'
    },
    { 
      id: 2, 
      email: 'si.logoz@gmail.com', 
      createdAt: '07/23/2022', 
      filename: 'data-dummy-1.xlsx', 
      filepath: 'http://example.com/data-dummy-1.xlsx',
      totalOrder: 412,
      approveBy: 'Babang',
      status: 'completed'
    }
  ]
};
const fields = [
  {
    title: "#",
    render: (elem, _, index) => {
      elem.innerText = index;
    }
  },
  {
    title: "Requested Date",
    width: '121px',
    dataIndex: 'createdAt'
  },
  {
    title: "Email",
    width: '215px',
    dataIndex: 'email'
  },
  {
    title: "Import Bulk Order",
    width: '182px',
    render: (elem, data) => {
      if(data.filename) {
        elem.innerHTML = `
          <div class="file-link">
            <a href="${data.filepath}" title="${data.filename}" download>
              ${data.filename}
            </a>
          </div>
        `;
      } else {
        elem.innerText = 'N/A'
      }
    }
  },
  {
    title: "Total Order",
    render: (elem, data) => {
      elem.innerText = data.totalOrder || '-'
    }
  },
  {
    title: "Approved By",
    width: '215px',
    render: (elem, data) => {
      elem.innerText = data.approvedBy || '-'
    }
  },
  {
    title: "Status",
    render: (elem, data) => {
      elem.innerText = changeWordCase(data.status, ' ', '-')
    }
  },
  {
    title: "Action",
    width: '102px',
    render: (elem, data) => {
      const anchor = document.createElement('a');
      anchor.classList.add('button', 'button-small', 'btn-action')
      anchor.setAttribute('href', `/orders/detail/${data.id}`)
      anchor.innerText = 'View Detail'
      elem.append(anchor);
    }
  },
];

const table = new TableDynamic({
  elem: '#table-data', 
  options: {
    initialData: initialData,
    fields: fields,
    customRow(el, data){
      if(data.status === 'failed'){
        el.classList.add('trow-failed')
      }
    },
    onChange(data){
      if(data?.page) {
        historyState.pushState({ page: `${data.page}` })
      }
    },
    withLoading: true,
    withPagination: true
  }
});
```
