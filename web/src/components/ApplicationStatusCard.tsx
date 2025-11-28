import React from 'react';
                    <div>
                        <CardTitle>{program}</CardTitle>
                        <CardDescription>{institution}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(status)}>
                        {status}
                    </Badge>
                </div >
            </CardHeader >
    <CardContent>
        {score !== undefined && (
            <div className="text-sm text-muted-foreground">
                Merit Score: {score}
            </div>
        )}
    </CardContent>
        </Card >
    );
}
