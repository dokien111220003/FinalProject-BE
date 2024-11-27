const ImportHistory = require("../models/importHistorySchema ");
const Product = require("../models/ProductModel");

// const getAllImportHistory = (limit, page, sort, filter) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const totalImportHistory = await ImportHistory.count();
//       let allImportHistory = [];

//       if (filter) {
//         const label = filter[0];
//         const allObjectFilter = await ImportHistory.find({
//           [label]: { $regex: filter[1] },
//         })
//           .limit(limit)
//           .skip(page * limit)
//           .sort({ createdAt: -1, updatedAt: -1 });
//         resolve({
//           status: "OK",
//           message: "Success",
//           data: allObjectFilter,
//           total: totalImportHistory,
//           pageCurrent: Number(page + 1),
//           totalPage: Math.ceil(totalImportHistory / limit),
//         });
//       }

//       if (sort) {
//         const objectSort = {};
//         objectSort[sort[1]] = sort[0];
//         const allImportHistorySort = await ImportHistory.find()
//           .limit(limit)
//           .skip(page * limit)
//           .sort(objectSort)
//           .sort({ createdAt: -1, updatedAt: -1 });
//         resolve({
//           status: "OK",
//           message: "Success",
//           data: allImportHistorySort,
//           total: totalImportHistory,
//           pageCurrent: Number(page + 1),
//           totalPage: Math.ceil(totalImportHistory / limit),
//         });
//       }

//       if (!limit) {
//         allImportHistory = await ImportHistory.find().sort({
//           createdAt: -1,
//           updatedAt: -1,
//         });
//       } else {
//         allImportHistory = await ImportHistory.find()
//           .limit(limit)
//           .skip(page * limit)
//           .sort({ createdAt: -1, updatedAt: -1 });
//       }

//       resolve({
//         status: "OK",
//         message: "Success",
//         data: allImportHistory,
//         total: totalImportHistory,
//         pageCurrent: Number(page + 1),
//         totalPage: Math.ceil(totalImportHistory / limit),
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

const getAllImportHistory = (limit, page, sort, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalImportHistory = await ImportHistory.count();
      let allImportHistory = [];

      // Filter condition
      if (filter) {
        const label = filter[0];
        const allObjectFilter = await ImportHistory.find({
          [label]: { $regex: filter[1] },
        })
          .populate("productId", "name type") // Populate name and type from Product
          .limit(limit)
          .skip(page * limit)
          .sort({ createdAt: -1, updatedAt: -1 });

        return resolve({
          status: "OK",
          message: "Success",
          data: allObjectFilter,
          total: totalImportHistory,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalImportHistory / limit),
        });
      }

      // Sort condition
      if (sort) {
        const objectSort = {};
        objectSort[sort[1]] = sort[0];
        const allImportHistorySort = await ImportHistory.find()
          .populate("productId", "name type") // Populate name and type from Product
          .limit(limit)
          .skip(page * limit)
          .sort(objectSort)
          .sort({ createdAt: -1, updatedAt: -1 });

        return resolve({
          status: "OK",
          message: "Success",
          data: allImportHistorySort,
          total: totalImportHistory,
          pageCurrent: Number(page + 1),
          totalPage: Math.ceil(totalImportHistory / limit),
        });
      }

      // Default fetch all with pagination and sorting
      if (!limit) {
        allImportHistory = await ImportHistory.find()
          .populate("productId", "name type") // Populate name and type from Product
          .sort({ createdAt: -1, updatedAt: -1 });
      } else {
        allImportHistory = await ImportHistory.find()
          .populate("productId", "name type") // Populate name and type from Product
          .limit(limit)
          .skip(page * limit)
          .sort({ createdAt: -1, updatedAt: -1 });
      }

      // Final response
      resolve({
        status: "OK",
        message: "Success",
        data: allImportHistory,
        total: totalImportHistory,
        pageCurrent: Number(page + 1),
        totalPage: Math.ceil(totalImportHistory / limit),
      });
    } catch (e) {
      reject(e);
    }
  });
};
const getDetailsImportHistory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const importHistory = await ImportHistory.findOne({
        _id: id,
      });
      if (importHistory === null) {
        resolve({
          status: "ERR",
          message: "The product is not defined",
        });
      }

      resolve({
        status: "OK",
        message: "SUCESS",
        data: importHistory,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getAllType = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allType = await ImportHistory.distinct("type");
      resolve({
        status: "OK",
        message: "Success",
        data: allType,
      });
    } catch (e) {
      reject(e);
    }
  });
};

async function addProductStock({ productId, importedQuantity, importedAt }) {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return { status: "ERR", message: "Product not found" };
    }

    const newImportHistory = new ImportHistory({
      productId,
      importedQuantity,
      importedAt,
    });

    product.countInStock += importedQuantity;
    await product.save();
    await newImportHistory.save();

    return {
      status: "OK",
      message: "Stock updated successfully",
      data: newImportHistory,
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  getAllImportHistory,
  getDetailsImportHistory,
  getAllType,
  addProductStock,
};
