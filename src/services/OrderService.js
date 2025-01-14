const Order = require("../models/OrderProduct")
const Product = require("../models/ProductModel")
const EmailService = require("../services/EmailService")

const createOrder = (newOrder) => {
    return new Promise(async (resolve, reject) => {
        const { orderItems,paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, phone,user, isPaid, paidAt,email } = newOrder
        try {
            const promises = orderItems.map(async (order) => {
                const productData = await Product.findOneAndUpdate(
                    {
                    _id: order.product,
                    countInStock: {$gte: order.amount}
                    },
                    {$inc: {
                        countInStock: -order.amount,
                        selled: +order.amount
                    }},
                    {new: true}
                )
                if(productData) {
                    return {
                        status: 'OK',
                        message: 'SUCCESS'
                    }
                }
                 else {
                    return{
                        status: 'OK',
                        message: 'ERR',
                        id: order.product
                    }
                }
            })
            const results = await Promise.all(promises)
            const newData = results && results.filter((item) => item.id)
            if(newData.length) {
                const arrId = []
                newData.forEach((item) => {
                    arrId.push(item.id)
                })
                resolve({
                    status: 'ERR',
                    message: `Product with id: ${arrId.join(',')} does not have enough qty`
                })
            } else {
                const createdOrder = await Order.create({
                    orderItems,
                    shippingAddress: {
                        fullName,
                        address,
                        city, phone
                    },
                    paymentMethod,
                    itemsPrice,
                    shippingPrice,
                    totalPrice,
                    user: user,
                    isPaid, paidAt
                })
                if (createdOrder) {
                    await EmailService.sendEmailCreateOrder(email,orderItems)
                    resolve({
                        status: 'OK',
                        message: 'success'
                    })
                }
            }
        } catch (e) {
        //   console.log('e', e)
            reject(e)
        }
    })
}

// const deleteManyProduct = (ids) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             await Product.deleteMany({ _id: ids })
//             resolve({
//                 status: 'OK',
//                 message: 'Delete product success',
//             })
//         } catch (e) {
//             reject(e)
//         }
//     })
// }

const getAllOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.find({
                user: id
            }).sort({createdAt: -1, updatedAt: -1})
            if (order === null) {
                resolve({
                    status: 'ERR',
                    message: 'The order is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCESSS',
                data: order
            })
        } catch (e) {
            // console.log('e', e)
            reject(e)
        }
    })
}

const getOrderDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.findById({
                _id: id
            })
            if (order === null) {
                resolve({
                    status: 'ERR',
                    message: 'The order is not defined'
                })
            }

            resolve({
                status: 'OK',
                message: 'SUCESSS',
                data: order
            })
        } catch (e) {
            // console.log('e', e)
            reject(e)
        }
    })
}

const cancelOrderDetails = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let order = []
            const promises = data.map(async (order) => {
                const productData = await Product.findOneAndUpdate(
                    {
                    _id: order.product,
                    selled: {$gte: order.amount}
                    },
                    {$inc: {
                        countInStock: +order.amount,
                        selled: -order.amount
                    }},
                    {new: true}
                )
                if(productData) {
                    order = await Order.findByIdAndDelete(id)
                    if (order === null) {
                        resolve({
                            status: 'ERR',
                            message: 'The order is not defined'
                        })
                    }
                } else {
                    return{
                        status: 'OK',
                        message: 'ERR',
                        id: order.product
                    }
                }
            })
            const results = await Promise.all(promises)
            const newData = results && results[0] && results[0].id
            
            if(newData) {
                resolve({
                    status: 'ERR',
                    message: `Product with id: ${newData} does not exit`
                })
            }
            resolve({
                status: 'OK',
                message: 'success',
                data: order
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getAllOrder = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allOrder = await Order.find().sort({createdAt: -1, updatedAt: -1})
            resolve({
                status: 'OK',
                message: 'Success',
                data: allOrder
            })
        } catch (e) {
            reject(e)
        }
    })
}

const getStatistics = (startDate, endDate) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Convert string dates to Date objects
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            // Debug logs
            console.log('Date range:', { start, end });

            const matchStage = {
                createdAt: {
                    $gte: start,
                    $lte: end
                }
            };

            // Debug current data
            const allOrders = await Order.find({});
            console.log('All orders in DB:', allOrders.length);
            
            // Get statistics
            const totalOrders = await Order.countDocuments(matchStage);
            const uniqueCustomers = await Order.distinct('shippingAddress.phone', matchStage);

            const ordersByDate = await Order.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 },
                        revenue: { $sum: "$totalPrice" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            const topSellingItems = await Order.aggregate([
                { $match: matchStage },
                { $unwind: "$orderItems" },
                {
                    $group: {
                        _id: "$orderItems.product",
                        productName: { $first: "$orderItems.name" },
                        totalQuantity: { $sum: "$orderItems.amount" },
                        totalRevenue: {
                            $sum: {
                                $multiply: ["$orderItems.price", "$orderItems.amount"]
                            }
                        }
                    }
                },
                { $sort: { totalQuantity: -1 } },
                { $limit: 5 }
            ]);

            const orderStatus = await Order.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        paidOrders: {
                            $sum: { $cond: ["$isPaid", 1, 0] }
                        },
                        deliveredOrders: {
                            $sum: { $cond: ["$isDelivered", 1, 0] }
                        },
                        totalRevenue: { $sum: "$totalPrice" }
                    }
                }
            ]);

            // Debug results
            console.log('Statistics results:', {
                totalOrders,
                uniqueCustomers: uniqueCustomers.length,
                ordersByDate,
                topSellingItems,
                orderStatus: orderStatus[0]
            });

            resolve({
                status: 'OK',
                message: 'Success',
                data: {
                    totalOrders,
                    uniqueCustomers: uniqueCustomers.length,
                    ordersByDate,
                    topSellingItems,
                    orderStatus: orderStatus[0] || {
                        totalOrders: 0,
                        paidOrders: 0,
                        deliveredOrders: 0,
                        totalRevenue: 0
                    }
                }
            });
        } catch (error) {
            console.error('Service error:', error);
            reject({
                status: 'ERR',
                message: error.message,
                error: error
            });
        }
    });
};

const updateDeliveryStatus = (id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkOrder = await Order.findOne({
                _id: id
            })
            if (checkOrder === null) {
                resolve({
                    status: 'ERR',
                    message: 'The order is not defined'
                })
            }

            const updatedOrder = await Order.findByIdAndUpdate(id, 
                { 
                    isDelivered: data.isDelivered,
                    deliveredAt: data.isDelivered ? new Date() : null
                }, 
                { new: true }
            )
            
            resolve({
                status: 'OK',
                message: 'Update delivery status success',
                data: updatedOrder
            })
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createOrder,
    getAllOrderDetails,
    getOrderDetails,
    cancelOrderDetails,
    getAllOrder,
    getStatistics,
    updateDeliveryStatus
}