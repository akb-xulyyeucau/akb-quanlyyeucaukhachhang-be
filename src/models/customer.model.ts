import mongoose, { Model } from "mongoose";
import { ICustomer } from "../interfaces/customer.interface";

const customerSchema = new mongoose.Schema<ICustomer>({
    alias : { type: String, required: true, unique: true },
    userId : {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true , unique: true},
    name : {type: String, required: true},
    emailContact : {type: String, required: true , unique: true},
    phoneContact : {type: String, required: true },
    companyName : {type: String},
    dob : {type: Date},
    address : {type: String},
    note : {type: String},
}, {timestamps: true})

const Customer : Model<ICustomer> = mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;
