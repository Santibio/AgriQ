import { Card, CardBody } from '@heroui/react';
import { ArrowDownRight, ArrowUpRight, DollarSign, TrendingUp, Truck } from 'lucide-react';
import React from 'react'


const stats = [
  {
    title: "Producción Hoy",
    value: "1,250kg",
    change: "+12%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "Ventas del Mes",
    value: "$45,230",
    change: "+8%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Envíos Pendientes",
    value: "23",
    change: "-5%",
    trend: "down",
    icon: Truck,
  },
];

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="bg-white/70 backdrop-blur-sm border-white/20"
        >
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`flex items-center space-x-1 ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <stat.icon className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export default StatsCards