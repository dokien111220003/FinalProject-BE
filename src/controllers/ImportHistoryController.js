const ImportHistoryService = require("../services/ImportHistoryService");

const getAllImportHistory = async (req, res) => {
  try {
    const { limit, page, sort, filter } = req.query;

    const importHistoryData = await ImportHistoryService.getAllImportHistory(
      parseInt(limit) || 10, // Số lượng kết quả trên mỗi trang, mặc định là 10
      parseInt(page) || 0, // Trang hiện tại, mặc định là 0
      sort ? sort.split(":") : null, // Sắp xếp, ví dụ: 'asc:price'
      filter ? filter.split(":") : null // Bộ lọc, ví dụ: 'name:sample'
    );

    return res.status(200).json(importHistoryData);
  } catch (err) {
    return res.status(500).json({
      status: "ERROR",
      message:
        err.message || "An error occurred while fetching import history.",
    });
  }
};

const getDetailsImportHistory = async (req, res) => {
  try {
    const  importHistoryId = req.params.id;
    if (!importHistoryId) {
      return res.status(200).json({
        status: "ERR",
        message: "The History Id is required",
      });
    }
    const response = await ImportHistoryService.getDetailsImportHistory(importHistoryId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllType = async (req, res) => {
  try {
    const response = await ImportHistoryService.getAllType();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const addProductStock = async (req, res) => {
  try {
    const { productId, importedQuantity, importedAt } = req.body;

    if (!productId || !importedQuantity) {
      return res.status(400).json({
        status: "ERR",
        message: "Product ID, imported quantity, and imported date are required.",
      });
    }

    const response = await ImportHistoryService.addProductStock(req.body);
    return res.status(200).json(response);

  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

module.exports = {
  getAllImportHistory,
  getDetailsImportHistory,
  getAllType,
  addProductStock
};
