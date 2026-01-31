import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import authRoutes from './routes/auth';
import contestRoutes from './routes/contests';
import problemRoutes from './routes/problems';

const app = express();
const port = Number(process.env.PORT);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/problems', problemRoutes);


app.listen(port, () => {
    console.log(`Listening to Aujla on port ${port}`);
});