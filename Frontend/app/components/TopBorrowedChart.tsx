import React from "react";
import { Dimensions, ScrollView } from "react-native";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
    labelColor: () => "#000000",
};

const chartStyle = {
    marginBottom: 10,
};

export default function TopBorrowedChart({ data }: { data: { title: string; count: number }[] }) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
                data={{
                    labels: data.map((b) =>
                        b.title.length > 0 ? b.title.slice(0, 1) + "…" : b.title
                    ),
                    datasets: [{ data: data.map((b) => b.count) }],
                }}
                width={screenWidth - 40}
                height={250}
                fromZero
                yAxisLabel=""
                yAxisSuffix=" เล่ม"
                chartConfig={chartConfig}
                verticalLabelRotation={20}
                style={chartStyle}
            />
        </ScrollView>
    );
}
