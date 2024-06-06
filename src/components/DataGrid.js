 const DataGridComponent = () => {
   const [rows, setRows] = useState([]);
   const columns = [{ key: 'id', name: 'ID' }, { key: 'username', name: 'Username' }];

   useEffect(() => {
     const getData = async () => {
       const { data } = await fetchData(); // Define fetchData in api.js
       setRows(data);
     };
     getData();
   }, []);

   return <DataGrid columns={columns} rows={rows} />;
 };

 export default DataGridComponent;
 ```
