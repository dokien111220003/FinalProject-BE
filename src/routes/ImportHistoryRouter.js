const express = require("express");
const router = express.Router()
const ImportHistoryController = require('../controllers/ImportHistoryController');

router.get('/get-all', ImportHistoryController.getAllImportHistory )
router.get('/get-details/:id', ImportHistoryController.getDetailsImportHistory)
router.get('/get-all-type', ImportHistoryController.getAllType)
router.post("/add-stock", ImportHistoryController.addProductStock);

module.exports = router