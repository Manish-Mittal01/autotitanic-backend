import { Schema } from 'mongoose'

const productSchema = Schema({
    productId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    actual_price: {
        type: String,
        required: true
    },
    discount: {
        type: String,
        required: true
    },
    final_price: {
        type: String,
        required: true
    },
    variants_id: {
        type: String,
        required: true
    },
    rating: {
        type: String,
        required: true
    },
    variants: {
        type: [
            { size: String }
        ],
        default: [],
    },
    reviews: {
        type: [
            { type: String }
        ],
        default: [],
    },
    inStock: {
        type: Boolean,
        required: true,
        default: true
    }
})