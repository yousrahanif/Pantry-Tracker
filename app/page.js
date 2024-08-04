'use client'
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography, IconButton } from "@mui/material";
import { collection, deleteDoc, getDoc, getDocs, query, setDoc, doc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus, faTrashAlt, faSearch } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [itemName, setItemName] = useState('');
  const [currentItem, setCurrentItem] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBox, setShowSearchBox] = useState(false);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const updateItem = async () => {
    const oldDocRef = doc(collection(firestore, 'inventory'), currentItem);
    const newDocRef = doc(collection(firestore, 'inventory'), newItemName);
    const oldDocSnap = await getDoc(oldDocRef);

    if (oldDocSnap.exists()) {
      const { quantity } = oldDocSnap.data();
      await deleteDoc(oldDocRef);
      await setDoc(newDocRef, { quantity });
      await updateInventory();
    }
    setOpenUpdate(false);
    setNewItemName('');
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOpenUpdate = (item) => {
    setCurrentItem(item);
    setNewItemName(item);
    setOpenUpdate(true);
  };
  const handleCloseUpdate = () => setOpenUpdate(false);

  // Filter inventory based on search query
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2}
    
    
    sx={{
      backgroundImage: `url('image.jpeg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}

    >
      <Modal open={open} onClose={handleClose}>
        <Box position="absolute" top="50%" left="50%"
          width={400}
          bgcolor="white" border="2px solid #000" boxShadow={24}
          p={4} display="flex" flexDirection="column" gap={3}
          sx={{
            transform: 'translate(-50%,-50%)'
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
            <Button variant="outlined" onClick={() => {
              addItem(itemName);
              setItemName('');
              handleClose();
            }}>Add</Button>
          </Stack>
        </Box>
      </Modal>

      <Modal open={openUpdate} onClose={handleCloseUpdate}>
        <Box position="absolute" top="50%" left="50%"
          width={400}
          bgcolor="white" border="2px solid #000" boxShadow={24}
          p={4} display="flex" flexDirection="column" gap={3}
          sx={{
            transform: 'translate(-50%,-50%)'
          }}
        >
          <Typography variant="h6">Update Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField variant="outlined"
              fullWidth
              value={newItemName}
              onChange={(e) => {
                setNewItemName(e.target.value);
              }}
            />
            <Button variant="outlined" onClick={() => {
              updateItem();
            }}>Update</Button>
          </Stack>
        </Box>
      </Modal>

      {showSearchBox && (
        <TextField
          variant="outlined"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
      )}

      <Box border='12px solid white'>
        <Box width="800px" height="100px" bgcolor="#ADD8E6" display="flex" alignItems="center" justifyContent="center" position="relative">
          <Typography variant="h2" color="#333">
            Inventory Items
          </Typography>
          <Box display="flex" position="absolute" bottom={16} right={16} gap={2}>
            <IconButton
              onClick={handleOpen}
              sx={{
                backgroundColor: "#1976d2",
                color: "#fff",
                '&:hover': {
                  backgroundColor: "#115293"
                },
                borderRadius: "50%",
                width: 56,
                height: 56,
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </IconButton>
            <IconButton
              onClick={() => setShowSearchBox(!showSearchBox)}
              sx={{
                backgroundColor: "#1976d2",
                color: "#fff",
                '&:hover': {
                  backgroundColor: "#115293"
                },
                borderRadius: "50%",
                width: 56,
                height: 56,
              }}
            >
              <FontAwesomeIcon icon={faSearch} />
            </IconButton>
          </Box>
        </Box>

        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {
            filteredInventory.map(({ name, quantity }) => (
              <Box key={name} width="100%" minHeight="150px" display="flex" alignItems="center" bgcolor="#fff" padding={5}>
                <Typography variant="h3" color="#333" textAlign="left" flexGrow={1}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>

                <Typography variant="h3" color="#333" textAlign="center" mr={14}>
                  {quantity}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={() => addItem(name)}>Add <FontAwesomeIcon icon={faPlus} style={{ marginLeft: '8px' }} /></Button>
                  <Button variant="contained" onClick={() => removeItem(name)}>Remove <FontAwesomeIcon icon={faTrashAlt} style={{ marginLeft: '8px' }} /></Button>
                  <Button variant="contained" onClick={() => handleOpenUpdate(name)}>Update <FontAwesomeIcon icon={faEdit} style={{ marginLeft: '8px' }} /></Button>
                </Stack>
              </Box>
            ))}
        </Stack>
      </Box>
    </Box>
  );
}





// 'use client'
// import Image from "next/image";
// import { useState, useEffect } from "react";
// import { firestore } from "@/firebase";
// import { Box,Button,Modal,Stack,TextField,Typography } from "@mui/material";
// import { collection, deleteDoc, getDoc, getDocs, query, setDoc,doc} from "firebase/firestore";
// export default function Home() {
  
// const [inventory, setInventory] = useState([]); 
//   const [open, setOpen] = useState(false); 
//   const [itemName, setItemName] = useState('');
  
//   const updateInventory=async ()=>{
//     const snapeshot =query(collection(firestore,'inventory'))
//     const docs=await getDocs (snapeshot)
//     const inventoryList=[]
//     docs.forEach((doc)=>{
//       inventoryList.push({
//         name: doc.id,
//         ...doc.data(),
//       })
//     })
//     setInventory(inventoryList)
//   }

 


//   const addItem=async (item)=>{
//     const docRef=doc(collection(firestore, 'inventory'),item)
//     const docSnap=await getDoc(docRef)
//     if(docSnap.exists()){
//       const {quantity} = docSnap.data()
     
     
//     await setDoc(docRef, {quantity:quantity+1})
      
  
      
//     }
//     else{
//       await setDoc(docRef,{quantity:1})
//     }
//     await updateInventory()
//   }



// const removeItem=async (item)=>{
//   const docRef=doc(collection(firestore, 'inventory'),item)
//   const docSnap=await getDoc(docRef)
//   if(docSnap.exists){
//     const {quantity}=docSnap.data()
//     if (quantity===1){
//       await deleteDoc(docRef)
//     }
//     else{
//       await setDoc(docRef, {quantity:quantity-1})
//     }

    
//   }
//   await updateInventory()
// }

//   useEffect(()=>{
//     updateInventory()
//   },[])

//   const handleOpen = ()=>setOpen(true)
//   const handleClose=()=>setOpen(false)
//   return  (
//   <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2}> 
//   <Modal open={open}
// onClose={handleClose}>

// <Box position="absolute" top="50%" left="50%" 
// width={400}
// bgcolor="white" border="2px solid #000" boxShadow={24} 
// p={4} display="flex" flexDirection="column" gap={3}
// sx={{
//   transform:'translate(-50%,-50%)'
// }}
// >
//   <Typography variant="h6">Add Item</Typography>
//   <Stack width="100%" direction="row" spacing={2}>
// <TextField variant="outlined"
// fullWidth
// value={itemName}
// onChange={(e)=>{
//   setItemName(e.target.value)
// }}
// />
// <Button variant="outlined" onClick={()=>{
//   addItem(itemName)
//   setItemName('')
//   handleClose()

// }}>Add</Button>




//   </Stack>
  
// </Box>
//   </Modal>
//     {/* <Typography variant="h1">
//     Inventory Management
//     </Typography>  */}
//     <Button variant="contained" onClick={()=>{
//       handleOpen()
//     }}>Add a new Item</Button>
//     <Box border='1px solid #333'>
//       <Box width="800px" height="100px" bgcolor="#ADD8E6" display="flex" alignItems="center" justifyContent="center">
// <Typography variant="h2" color="#333">
//   Inventory Items
// </Typography>

//       </Box>
    
//     <Stack width="800px" height="300px" spacing={2} overflow="auto">
//       {
//         inventory.map(({name,quantity})=>(
//           <Box key={name} width="100%" minHeight="150px" display="flex" justifyContent="space-between" alignItems="center" bgColor="#f0f0f0"
//           padding={5}
//           >
// <Typography variant="h3" color="#333" textAlign="Center">
//   {name.charAt(0).toUpperCase()+name.slice(1)}</Typography>


//   <Typography variant="h3" color="#333" textAlign="Center">
//   {quantity}</Typography>
//   <Stack direction="row" spacing={2}>
//   <Button variant="contained" onClick={()=>addItem(name)}>Add</Button>
//   <Button variant="contained" onClick={()=>removeItem(name)}>Remove</Button>
//   </Stack>
//           </Box>
//         ))}
      
//     </Stack>
//     </Box>
    
//     </Box>
//   )
// }


// 'use client'
// import { useState, useEffect } from "react";
// import { firestore } from "@/firebase";
// import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
// import { collection, deleteDoc, getDoc, getDocs, query, setDoc, doc } from "firebase/firestore";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit, faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

// export default function Home() {
//   const [inventory, setInventory] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [openUpdate, setOpenUpdate] = useState(false);
//   const [itemName, setItemName] = useState('');
//   const [currentItem, setCurrentItem] = useState('');
//   const [newItemName, setNewItemName] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [image, setImage] = useState(null);

//   const updateInventory = async () => {
//     const snapshot = query(collection(firestore, 'inventory'));
//     const docs = await getDocs(snapshot);
//     const inventoryList = [];
//     docs.forEach((doc) => {
//       inventoryList.push({
//         name: doc.id,
//         ...doc.data(),
//       });
//     });
//     setInventory(inventoryList);
//   };

//   const addItem = async (item) => {
//     const docRef = doc(collection(firestore, 'inventory'), item);
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       const { quantity } = docSnap.data();
//       await setDoc(docRef, { quantity: quantity + 1 });
//     } else {
//       await setDoc(docRef, { quantity: 1 });
//     }
//     await updateInventory();
//   };

//   const removeItem = async (item) => {
//     const docRef = doc(collection(firestore, 'inventory'), item);
//     const docSnap = await getDoc(docRef);
//     if (docSnap.exists()) {
//       const { quantity } = docSnap.data();
//       if (quantity === 1) {
//         await deleteDoc(docRef);
//       } else {
//         await setDoc(docRef, { quantity: quantity - 1 });
//       }
//     }
//     await updateInventory();
//   };

//   const updateItem = async () => {
//     const oldDocRef = doc(collection(firestore, 'inventory'), currentItem);
//     const newDocRef = doc(collection(firestore, 'inventory'), newItemName);
//     const oldDocSnap = await getDoc(oldDocRef);

//     if (oldDocSnap.exists()) {
//       const { quantity } = oldDocSnap.data();
//       await deleteDoc(oldDocRef);
//       await setDoc(newDocRef, { quantity });
//       await updateInventory();
//     }
//     setOpenUpdate(false);
//     setNewItemName('');
//   };

//   useEffect(() => {
//     updateInventory();
//   }, []);

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);
//   const handleOpenUpdate = (item) => {
//     setCurrentItem(item);
//     setNewItemName(item);
//     setOpenUpdate(true);
//   };
//   const handleCloseUpdate = () => setOpenUpdate(false);

//   // Filter inventory based on search query
//   const filteredInventory = inventory.filter(item =>
//     item.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2}
    
    
    
    
    
//     >
//       <Modal open={open} onClose={handleClose}>
//         <Box position="absolute" top="50%" left="50%"
//           width={400}
//           bgcolor="white" border="2px solid #000" boxShadow={24}
//           p={4} display="flex" flexDirection="column" gap={3}
//           sx={{
//             transform: 'translate(-50%,-50%)'
//           }}
//         >
//           <Typography variant="h6">Add Item</Typography>
//           <Stack width="100%" direction="row" spacing={2}>
//             <TextField variant="outlined"
//               fullWidth
//               value={itemName}
//               onChange={(e) => {
//                 setItemName(e.target.value);
//               }}
//             />
//             <Button variant="outlined" onClick={() => {
//               addItem(itemName);
//               setItemName('');
//               handleClose();
//             }}>Add</Button>
//           </Stack>
//         </Box>
//       </Modal>

//       <Modal open={openUpdate} onClose={handleCloseUpdate}>
//         <Box position="absolute" top="50%" left="50%"
//           width={400}
//           bgcolor="white" border="2px solid #000" boxShadow={24}
//           p={4} display="flex" flexDirection="column" gap={3}
//           sx={{
//             transform: 'translate(-50%,-50%)'
//           }}
//         >
//           <Typography variant="h6">Update Item</Typography>
//           <Stack width="100%" direction="row" spacing={2}>
//             <TextField variant="outlined"
//               fullWidth
//               value={newItemName}
//               onChange={(e) => {
//                 setNewItemName(e.target.value);
//               }}
//             />
//             <Button variant="outlined" onClick={() => {
//               updateItem();
//             }}>Update</Button>
//           </Stack>
//         </Box>
//       </Modal>

//       <Button variant="contained" onClick={() => {
//         handleOpen();
//       }}>Add a new Item</Button>
      
//       <TextField
//         variant="outlined"
//         placeholder="Search items..."
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         sx={{ mb: 2 }}
//       />

//       <Box border='1px solid #333'>
//         <Box width="800px" height="100px" bgcolor="#ADD8E6" display="flex" alignItems="center" justifyContent="center">
//           <Typography variant="h2" color="#333">
//             Inventory Items
//           </Typography>
//         </Box>

//         <Stack width="800px" height="300px" spacing={2} overflow="auto">
//           {
//             filteredInventory.map(({ name, quantity }) => (
//               <Box key={name} width="100%" minHeight="150px" display="flex" alignItems="center" bgColor="#f0f0f0" padding={5}>
//                 <Typography variant="h3" color="#333" textAlign="left" flexGrow={1}>
//                   {name.charAt(0).toUpperCase() + name.slice(1)}
//                 </Typography>

//                 <Typography variant="h3" color="#333" textAlign="center" mr={14}>
//                   {quantity}
//                 </Typography>
//                 <Stack direction="row" spacing={2}>
//                   <Button variant="contained" onClick={() => addItem(name)}>Add <FontAwesomeIcon icon={faPlus} style={{ marginLeft: '8px' }} />
                  
//                   </Button>
//                   <Button variant="contained" onClick={() => removeItem(name)}>Remove <FontAwesomeIcon icon={faTrashAlt} style={{ marginLeft: '8px' }} /></Button>
//                   <Button variant="contained" onClick={() => handleOpenUpdate(name)}>Update <FontAwesomeIcon icon={faTrashAlt} style={{ marginLeft: '8px' }} /> </Button>
//                 </Stack>
//               </Box>
//             ))}
//         </Stack>
//       </Box>
//     </Box>
//   );
// }