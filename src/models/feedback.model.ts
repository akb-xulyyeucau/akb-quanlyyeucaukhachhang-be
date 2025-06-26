import mongoose, { Model, Schema } from 'mongoose';
import {IFeedBack} from '../interfaces/feedback.interface';

const feedbackSchema = new mongoose.Schema<IFeedBack>({
    projectId : {type : mongoose.Schema.Types.ObjectId , ref : 'Project'},
    customerId : {type : mongoose.Schema.Types.ObjectId , ref : 'Customer'},
    rating : {type: String , enum : ['1' , '2' , '3' , '4' , '5'] },
    comment : {type : String},
    suggest : {type : String}
}, {timestamps : true}
)

const Feedback : Model<IFeedBack> = mongoose.model<IFeedBack>("Feedback" , feedbackSchema);
export default Feedback;